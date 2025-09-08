local json = require('json')

State = State
	or {
		SuperAdmin = State and State.SuperAdmin or nil, -- single address
		Controllers = {},
		Owners = {},
		Reserved = {},
		Requests = {},
		RequestSeq = 0,
		Policy = {
			MaxPerAddr = 4,
			RequireApproval = true,
		},
		Audit = {},
		Processed = {},
		Bootstrapped = false,
	}

-- =========================
-- Utils
-- =========================
local Utils = {}

function Utils.is_super_admin(addr)
	return State.SuperAdmin ~= nil and State.SuperAdmin == addr
end

function Utils.require_super_admin(addr)
	assert(Utils.is_super_admin(addr), 'super admin privileges required')
end

function Utils.normalize(name)
	assert(type(name) == 'string' and #name > 0, 'name must be non-empty string')
	local n = name:lower()
	assert(n:match('^[a-z0-9_%.-]+$'), 'invalid name: allowed [a-z0-9_%.%-]') -- restrictions based on undernames req
	return n
end

function Utils.is_controller(addr)
	return State.Controllers[addr] == true
end

function Utils.require_controller(addr)
	assert(Utils.is_controller(addr), 'controller privileges required')
end

function Utils.set_add(set, key)
	set[key] = true
end
function Utils.set_del(set, key)
	set[key] = nil
end

function Utils.ts(Msg)
	return tonumber(Msg.Timestamp)
end

function Utils.audit(actor, action, payload, Msg)
	table.insert(State.Audit, {
		at = Utils.ts(Msg),
		actor = actor,
		action = action,
		payload = payload or {},
	})
end

-- Prevent double-processing the same message
function Utils.once(Msg)
	if State.Processed[Msg.Id] then
		return false
	end
	State.Processed[Msg.Id] = true
	return true
end

local function reply(Msg, ok, result)
	ao.send({
		Target = Msg.From,
		Data = json.encode({ ok = ok, result = result }),
	})
end

-- =========================
-- Controllers
-- ========================

Controllers = {}

function Controllers.bootstrap_first(Msg)
	if not State.Bootstrapped then
		State.SuperAdmin = Msg.From
		Utils.set_add(State.Controllers, Msg.From)
		State.Bootstrapped = true
		Utils.audit(Msg.From, 'bootstrap_super_admin', { super_admin = Msg.From }, Msg)
		return { seeded = Msg.From, superAdmin = Msg.From }
	else
		return { message = 'already bootstrapped', superAdmin = State.SuperAdmin }
	end
end

function Controllers.add(actor, addr, Msg)
	Utils.require_super_admin(actor)
	if State.Controllers[addr] then
		return { info = 'already controller' }
	end
	Utils.set_add(State.Controllers, addr)
	Utils.audit(actor, 'add_controller', { addr = addr }, Msg)
	return { added = addr }
end

function Controllers.remove(actor, addr, Msg)
	Utils.require_super_admin(actor)
	if not State.Controllers[addr] then
		return { info = 'not a controller' }
	end
	Utils.set_del(State.Controllers, addr)
	Utils.audit(actor, 'remove_controller', { addr = addr }, Msg)
	return { removed = addr }
end

function Controllers.list()
	local out = {}
	for a, v in pairs(State.Controllers) do
		if v then
			table.insert(out, a)
		end
	end
	table.sort(out)
	return out
end

-- =========================
-- Reserved
-- =======================

Reserved = {}

function Reserved.add(actor, name, toAddr, Msg)
	Utils.require_controller(actor)
	name = Utils.normalize(name)
	if State.Owners[name] then
		error('name already registered')
	end
	State.Reserved[name] = { to = toAddr, by = actor, at = Utils.ts(Msg) }
	Utils.audit(actor, 'reserve_name', { name = name, to = toAddr }, Msg)
	return { reserved = name, to = toAddr }
end

function Reserved.remove(actor, name, Msg)
	Utils.require_controller(actor)
	name = Utils.normalize(name)
	State.Reserved[name] = nil
	Utils.audit(actor, 'unreserve_name', { name = name }, Msg)
	return { unreserved = name }
end

function Reserved.get(name)
	return State.Reserved[Utils.normalize(name)]
end

function Reserved.list()
	local out = {}
	for k, v in pairs(State.Reserved) do
		out[k] = v
	end
	return out
end

Requests = {}

-- request schema:
-- { id, name, requester, status="pending"|"approved"|"rejected"|"cancelled",
--   created_at, decided_at?, decided_by?, reason?, metadata = {} }
function Requests.create(requester, name, metadata, Msg)
	name = Utils.normalize(name)
	if State.Owners[name] then
		error('name already registered')
	end

	-- HARD BLOCK: if reserved for someone else, do not create a request
	local rinfo = State.Reserved[name]
	if rinfo and rinfo.to and rinfo.to ~= requester then
		error('name reserved for a different address')
	end

	-- dedupe same requester
	for _, req in pairs(State.Requests) do
		if req.name == name and req.requester == requester and req.status == 'pending' then
			return { id = req.id, info = 'duplicate pending' }
		end
	end

	State.RequestSeq = State.RequestSeq + 1
	local id = State.RequestSeq
	State.Requests[id] = {
		id = id,
		name = name,
		requester = requester,
		status = 'pending',
		created_at = Utils.ts(Msg),
		metadata = metadata or {},
	}
	Utils.audit(requester, 'request_undername', { id = id, name = name }, Msg)
	return { id = id }
end

function Requests.cancel(actor, id, Msg)
	local r = State.Requests[id]
	if not r then
		error('request not found')
	end
	if r.requester ~= actor then
		error('only requester can cancel')
	end
	if r.status ~= 'pending' then
		error('cannot cancel non-pending')
	end
	r.status = 'cancelled'
	r.decided_at = Utils.ts(Msg)
	r.decided_by = actor
	Utils.audit(actor, 'cancel_request', { id = id }, Msg)
	return { cancelled = id }
end

function Requests.approve(actor, id, Msg)
	Utils.require_controller(actor)
	local r = State.Requests[id]
	if not r then
		error('request not found')
	end
	if r.status ~= 'pending' then
		error('request not pending')
	end
	if State.Owners[r.name] then
		error('name already registered')
	end

	State.Owners[r.name] = r.requester
	r.status = 'approved'
	r.decided_at = Utils.ts(Msg)
	r.decided_by = actor

	-- clear any reservation (generic or to=addr)
	if State.Reserved[r.name] then
		State.Reserved[r.name] = nil
	end

	Utils.audit(actor, 'approve_request', { id = id, name = r.name, owner = r.requester }, Msg)
	return { approved = id, name = r.name, owner = r.requester }
end

function Requests.reject(actor, id, reason, Msg)
	Utils.require_controller(actor)
	local r = State.Requests[id]
	if not r then
		error('request not found')
	end
	if r.status ~= 'pending' then
		error('request not pending')
	end
	r.status = 'rejected'
	r.decided_at = Utils.ts(Msg)
	r.decided_by = actor
	r.reason = reason or 'unspecified'
	Utils.audit(actor, 'reject_request', { id = id, reason = r.reason }, Msg)
	return { rejected = id, reason = r.reason }
end

function Requests.list(filter)
	local out = {}
	for _, r in pairs(State.Requests) do
		local ok = true
		if filter then
			if filter.status and r.status ~= filter.status then
				ok = false
			end
			if ok and filter.name and r.name ~= Utils.normalize(filter.name) then
				ok = false
			end
			if ok and filter.requester and r.requester ~= filter.requester then
				ok = false
			end
		end
		if ok then
			table.insert(out, r)
		end
	end
	table.sort(out, function(a, b)
		return a.id < b.id
	end)
	return out
end

-- Ownership
Ownership = {}

function Ownership.owner_of(name)
	return State.Owners[Utils.normalize(name)]
end

function Ownership.force_release(actor, name, reason, Msg)
	Utils.require_controller(actor)
	name = Utils.normalize(name)
	if not State.Owners[name] then
		error('name not registered')
	end
	State.Owners[name] = nil
	Utils.audit(actor, 'force_release', { name = name, reason = reason }, Msg)
	return { released = name }
end

-- =========================
-- Internal: claim policy check
-- =========================
local function can_claim(addr, name)
	name = Utils.normalize(name)
	if State.Owners[name] then
		return false, 'name taken'
	end
	-- reserved is informative only; no block here
	local cap = tonumber(State.Policy.MaxPerAddr or 0)
	if cap and cap > 0 then
		local count = 0
		for _, owner in pairs(State.Owners) do
			if owner == addr then
				count = count + 1
			end
		end
		if count >= cap then
			return false, 'per-address limit reached'
		end
	end
	return true
end

-- =========================
-- Handlers (AO entrypoints)
-- =========================

-- Bootstrap first controller (one-time)
Handlers.add('PortalRegistry.Bootstrap', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local result = Controllers.bootstrap_first(Msg)
	reply(Msg, true, result)
end)

-- Controllers
Handlers.add('PortalRegistry.AddController', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local new_controller = assert(Msg.Addr, 'addr tag required')
	local r = Controllers.add(Msg.From, assert(new_controller, 'addr required'), Msg)
	reply(Msg, true, r)
end)

Handlers.add('PortalRegistry.RemoveController', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local remove_controller = assert(Msg.Addr, 'addr tag required')
	local r = Controllers.remove(Msg.From, assert(remove_controller, 'addr required'), Msg)
	reply(Msg, true, r)
end)

Handlers.add('PortalRegistry.ListControllers', function(Msg)
	reply(Msg, true, { controllers = Controllers.list() })
end)

-- Reserved
Handlers.add('PortalRegistry.AddReserved', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local name = assert(Msg.Name, 'name required')
	local to = Msg.to
	local r = Reserved.add(Msg.From, name, to, Msg)
	reply(Msg, true, r)
end)

Handlers.add('PortalRegistry.RemoveReserved', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local name = assert(Msg.Name, 'name required')
	local r = Reserved.remove(Msg.From, assert(name, 'name required'), Msg)
	reply(Msg, true, r)
end)

Handlers.add('PortalRegistry.ListReserved', function(Msg)
	reply(Msg, true, { reserved = Reserved.list() })
end)

-- Availability (read-only, for UI)

Handlers.add('PortalRegistry.CheckAvailability', function(Msg)
	local name = assert(Msg.Name, 'name required')
	local n = Utils.normalize(name)
	local ok, reason = can_claim(Msg.From, n)
	local r = State.Reserved[n]
	local reservedForCaller = r and r.to == Msg.From or false
	local canRequest = (State.Owners[n] == nil) and not (r and r.to and r.to ~= Msg.From)

	reply(Msg, true, {
		name = n,
		available = (State.Owners[n] == nil),
		takenBy = State.Owners[n],
		reserved = r ~= nil,
		reservedFor = r and r.to or nil,
		reservedForCaller = reservedForCaller,
		canRequest = canRequest,
		userReason = ok and nil or reason,
	})
end)

Handlers.add('PortalRegistry.Request', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local name_requested = assert(Msg.Name, 'name required')
	local nRequested = Utils.normalize(name_requested)

	-- Auto-claim if reserved for this address
	local rinfo = State.Reserved[nRequested]
	if rinfo and rinfo.to and rinfo.to == Msg.From then
		local ok, err = can_claim(Msg.From, nRequested)
		if not ok then
			error(err)
		end
		State.Owners[nRequested] = Msg.From
		State.Reserved[nRequested] = nil
		Utils.audit(Msg.From, 'claim_reserved_for', { name = nRequested }, Msg)
		reply(Msg, true, { status = 'approved', auto = true, name = nRequested, owner = Msg.From })
		return
	end

	if not State.Policy.RequireApproval then
		local ok, err = can_claim(Msg.From, nRequested)
		if not ok then
			error(err)
		end
		State.Owners[nRequested] = Msg.From
		if rinfo then
			State.Reserved[nRequested] = nil
		end
		Utils.audit(Msg.From, 'self_claim', { name = nRequested }, Msg)
		reply(Msg, true, { status = 'approved', auto = true, name = nRequested, owner = Msg.From })
		return
	end

	local ok, err = can_claim(Msg.From, nRequested)
	if not ok then
		error(err)
	end
	local res = Requests.create(Msg.From, nRequested, b.metadata, Msg)
	reply(Msg, true, { status = 'pending', id = res.id, name = nRequested })
end)

Handlers.add('PortalRegistry.Cancel', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local cancel_id = assert(Msg.Id, 'id required')
	local r = Requests.cancel(Msg.From, cancel_id, Msg)
	reply(Msg, true, r)
end)

Handlers.add('PortalRegistry.Approve', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local approve_id = assert(Msg.Id, 'id required')
	local r = Requests.approve(Msg.From, approve_id, Msg)
	reply(Msg, true, r)
end)

Handlers.add('PortalRegistry.Reject', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local reject_id = assert(Msg.Id, 'id required')
	local reject_reason = Msg.Reason
	local r = Requests.reject(Msg.From, reject_id, reject_reason, Msg)
	reply(Msg, true, r)
end)

Handlers.add('PortalRegistry.ListRequests', function(Msg)
	local filter = json.decode(Msg.Data or '{}')
	reply(Msg, true, { requests = Requests.list(filter) })
end)

-- Ownership
Handlers.add('PortalRegistry.OwnerOf', function(Msg)
	local name = assert(Msg.Name, 'name required')
	reply(Msg, true, { owner = Ownership.owner_of(name) })
end)

Handlers.add('PortalRegistry.ForceRelease', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local release_name = assert(Msg.Name, 'name required')
	local reason = Msg.Reason or 'unspecified'
	local r = Ownership.force_release(Msg.From, release_name, reason, Msg)
	reply(Msg, true, r)
end)

-- Policy (optional updater)
Handlers.add('PortalRegistry.SetPolicy', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	Utils.require_controller(Msg.From)

	local updates = {}

	-- MaxPerAddr (number)
	if Msg.Tags.MaxPerAddr ~= nil then
		local n = tonumber(Msg.Tags.MaxPerAddr)
		assert(n and n >= 0, 'MaxPerAddr must be a non-negative number')
		State.Policy.MaxPerAddr = n
		updates.MaxPerAddr = n
	end

	-- RequireApproval (boolean)
	if Msg.Tags.RequireApproval ~= nil then
		local v = tostring(Msg.Tags.RequireApproval):lower()
		local b
		if v == 'true' or v == '1' or v == 'yes' or v == 'on' then
			b = true
		elseif v == 'false' or v == '0' or v == 'no' or v == 'off' then
			b = false
		else
			error('RequireApproval must be a boolean string')
		end
		State.Policy.RequireApproval = b
		updates.RequireApproval = b
	end

	if next(updates) == nil then
		reply(Msg, true, { policy = State.Policy, info = 'no changes' })
		return
	end

	Utils.audit(Msg.From, 'set_policy', updates, Msg)
	reply(Msg, true, { policy = State.Policy, updated = updates })
end)

-- Listings & audit
Handlers.add('PortalRegistry.ListUndernames', function(Msg)
	local rows = {}
	for name, owner in pairs(State.Owners) do
		table.insert(rows, { name = name, owner = owner })
	end
	table.sort(rows, function(a, b)
		return a.name < b.name
	end)
	reply(Msg, true, { undernames = rows })
end)

Handlers.add('PortalRegistry.TransferSuperAdmin', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	Utils.require_super_admin(Msg.From)
	local newAdmin = assert(Msg.NewAdmin, 'addr required')
	State.SuperAdmin = newAdmin
	Utils.audit(Msg.From, 'transfer_super_admin', { new_super_admin = newAdmin }, Msg)
	reply(Msg, true, { superAdmin = newAdmin })
end)

Handlers.add('PortalRegistry.Audit', function(Msg)
	reply(Msg, true, { audit = State.Audit })
end)

Handlers.add('PortalRegistry.Export', function(Msg)
	reply(Msg, true, {
		superAdmin = State.SuperAdmin,
		controllers = Controllers.list(),
		policy = State.Policy,
		reserved = Reserved.list(),
		owners = State.Owners,
		requests = State.Requests,
		requestSeq = State.RequestSeq,
	})
end)
