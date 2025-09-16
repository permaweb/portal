local json = require('json')

State = State
	or {
		SuperAdmin = nil,
		Controllers = {},
		Owners = {},
		Reserved = {},
		Requests = {},
		RequestSeq = 0,
		Policy = {
			MaxPerEntity = 1,
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
-- Owners helpers (fresh schema only)
-- =========================
local function Owners_get(name)
	return State.Owners[name]
end

local function Owners_exists(name)
	local rec = State.Owners[name]
	return rec ~= nil and rec.owner ~= nil
end

local function Owners_set(name, owner, meta)
	State.Owners[name] = {
		owner = owner,
		requestedAt = meta and meta.requestedAt or nil,
		approvedAt = meta and meta.approvedAt or nil,
		approvedBy = meta and meta.approvedBy or nil,
		requestId = meta and meta.requestId or nil,
		source = meta and meta.source or nil,
		auto = meta and meta.auto or false,
	}
end

local function Owners_countByAddress(addr)
	local c = 0
	for _, rec in pairs(State.Owners) do
		if rec and rec.owner == addr then
			c = c + 1
		end
	end
	return c
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
	if Owners_exists(name) then
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
--   decidedAt?, decidedBy?, reason?, metadata = {} }
function Requests.create(requester, name, Msg)
	name = Utils.normalize(name)
	if Owners_exists(name) then
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
		createdAt = Utils.ts(Msg),
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
	r.decidedAt = Utils.ts(Msg)
	r.decidedBy = actor
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
	if Owners_exists(r.name) then
		error('name already registered')
	end

	Owners_set(r.name, r.requester, {
		requestedAt = r.createdAt,
		approvedAt = Utils.ts(Msg),
		approvedBy = actor,
		requestId = r.id,
		source = 'approval',
	})
	r.status = 'approved'
	r.decidedAt = Utils.ts(Msg)
	r.decidedBy = actor

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
	r.decidedAt = Utils.ts(Msg)
	r.decidedBy = actor
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
	local rec = Owners_get(Utils.normalize(name))
	return rec and rec.owner or nil
end

function Ownership.force_release(actor, name, reason, Msg)
	name = Utils.normalize(name)

	local rec = Owners_get(name)
	if not rec then
		error('name not registered')
	end

	local isController = Utils.is_controller(actor)
	local isOwner = (rec.owner == actor)
	if not (isController or isOwner) then
		error('not permitted: must be controller or current owner')
	end

	State.Owners[name] = nil
	Utils.audit(actor, 'force_release', {
		name = name,
		reason = reason or 'unspecified',
		wasOwner = rec.owner,
		by = isOwner and 'owner' or 'controller',
	}, Msg)

	return { released = name }
end
-- =========================
-- Internal: claim policy check
-- =========================
local function can_claim(addr, name)
	name = Utils.normalize(name)
	if Owners_exists(name) then
		return false, 'name taken'
	end
	local cap = tonumber(State.Policy.MaxPerEntity or 0)
	if cap and cap > 0 then
		if Owners_countByAddress(addr) >= cap then
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
	local new_controller = Msg.Addr
	if not new_controller or #new_controller == 0 then
		reply(Msg, false, { error = 'Addr tag required' })
		return
	end
	local r = Controllers.add(Msg.From, new_controller, Msg)
	reply(Msg, true, r)
end)

Handlers.add('PortalRegistry.RemoveController', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local remove_controller = Msg.Addr
	if not remove_controller or #remove_controller == 0 then
		reply(Msg, false, { error = 'Addr tag required' })
		return
	end
	local r = Controllers.remove(Msg.From, remove_controller, Msg)
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
	local name = Msg.Name
	if not name or #name == 0 then
		reply(Msg, false, { error = 'Name tag required' })
		return
	end
	local to = Msg.To
	if not to or #to == 0 then
		reply(Msg, false, { error = 'To tag required' })
		return
	end
	local r = Reserved.add(Msg.From, name, to, Msg)
	reply(Msg, true, r)
end)

Handlers.add('PortalRegistry.RemoveReserved', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local name = Msg.Name
	if not name or #name == 0 then
		reply(Msg, false, { error = 'Name tag required' })
		return
	end
	local r = Reserved.remove(Msg.From, name, Msg)
	reply(Msg, true, r)
end)

Handlers.add('PortalRegistry.ListReserved', function(Msg)
	reply(Msg, true, { reserved = Reserved.list() })
end)

-- Availability (read-only, for UI)

Handlers.add('PortalRegistry.CheckAvailability', function(Msg)
	local name = Msg.Name
	if not name or #name == 0 then
		reply(Msg, false, { error = 'Name tag required' })
		return
	end
	local n = Utils.normalize(name)
	local ok, reason = can_claim(Msg.From, n)
	local rec = Owners_get(n)
	local r = State.Reserved[n]
	local reservedForCaller = r and r.to == Msg.From or false
	local count = Owners_countByAddress(Msg.From)
	local canRequest = (rec == nil)
		and not (r and r.to and r.to ~= Msg.From)
		and (State.Policy.MaxPerEntity == nil or count < State.Policy.MaxPerEntity)

	reply(Msg, true, {
		name = n,
		available = (rec == nil),
		takenBy = rec and rec.owner or nil,
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
	local name_requested = Msg.Name
	if not name_requested or #name_requested == 0 then
		reply(Msg, false, { error = 'Name tag required' })
		return
	end
	local requestersOwnedCount = Owners_countByAddress(Msg.From)
	if State.Policy.MaxPerEntity and requestersOwnedCount >= State.Policy.MaxPerEntity then
		reply(Msg, false, { error = 'per-address limit reached' })
		return
	end
	local nRequested = Utils.normalize(name_requested)

	-- Auto-claim if reserved for this address
	local rinfo = State.Reserved[nRequested]
	if rinfo and rinfo.to and rinfo.to == Msg.From then
		local ok, err = can_claim(Msg.From, nRequested)
		if not ok then
			reply(Msg, false, { error = err })
			return
		end
		Owners_set(nRequested, Msg.From, {
			requestedAt = Utils.ts(Msg),
			approvedAt = Utils.ts(Msg),
			approvedBy = Msg.From, --self-approved
			source = 'reserved',
			auto = true,
		})
		State.Reserved[nRequested] = nil
		Utils.audit(Msg.From, 'claim_reserved_for', { name = nRequested }, Msg)
		reply(Msg, true, { status = 'approved', auto = true, name = nRequested, owner = Msg.From })
		return
	end

	if not State.Policy.RequireApproval then
		local ok, err = can_claim(Msg.From, nRequested)
		if not ok then
			reply(Msg, false, { error = err })
			return
		end
		Owners_set(nRequested, Msg.From, {
			requestedAt = Utils.ts(Msg),
			approvedAt = Utils.ts(Msg),
			approvedBy = Msg.From,
			source = 'self',
			auto = true,
		})
		if rinfo then
			State.Reserved[nRequested] = nil
		end
		Utils.audit(Msg.From, 'self_claim', { name = nRequested }, Msg)
		reply(Msg, true, { status = 'approved', auto = true, name = nRequested, owner = Msg.From })
		return
	end

	local ok, err = can_claim(Msg.From, nRequested)
	if not ok then
		reply(Msg, false, { error = err })
		return
	end
	local res = Requests.create(Msg.From, nRequested, Msg)
	reply(Msg, true, { status = 'pending', id = res.id, name = nRequested })
end)

Handlers.add('PortalRegistry.Cancel', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local cancel_id = Msg.Id
	if not cancel_id then
		reply(Msg, false, { error = 'cancel id tag required Msg.Id' })
		return
	end
	local r = Requests.cancel(Msg.From, tonumber(cancel_id), Msg)
	reply(Msg, true, r)
end)

Handlers.add('PortalRegistry.Approve', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local approve_id = Msg.Id
	if not approve_id then
		reply(Msg, false, { error = 'request id tag required Msg.Id' })
		return
	end
	local r = Requests.approve(Msg.From, tonumber(approve_id), Msg)
	reply(Msg, true, r)
end)

Handlers.add('PortalRegistry.Reject', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local reject_id = Msg.Id
	if not reject_id then
		reply(Msg, false, { error = 'request id tag required Msg.Id' })
		return
	end
	local reject_reason = Msg.Reason or 'unspecified'
	local r = Requests.reject(Msg.From, tonumber(reject_id), reject_reason, Msg)
	reply(Msg, true, r)
end)

Handlers.add('PortalRegistry.ListRequests', function(Msg)
	reply(Msg, true, { requests = Requests.list() })
end)

-- Ownership
Handlers.add('PortalRegistry.OwnerOf', function(Msg)
	local name = Msg.Name
	if not name or #name == 0 then
		reply(Msg, false, { error = 'Name tag required' })
		return
	end
	reply(Msg, true, { owner = Ownership.owner_of(name) })
end)

Handlers.add('PortalRegistry.ForceRelease', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	local release_name = Msg.Name
	if not release_name or #release_name == 0 then
		reply(Msg, false, { error = 'Name tag required' })
		return
	end
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

	-- MaxPerEntity (number)
	if Msg.MaxPerEntity ~= nil then
		local new_max_per_addr = tonumber(Msg.MaxPerEntity)
		if not new_max_per_addr or new_max_per_addr <= 0 then
			reply(Msg, false, { error = 'MaxPerEntity must be a positive number' })
			return
		end
		State.Policy.MaxPerEntity = new_max_per_addr
		updates.MaxPerEntity = new_max_per_addr
	end

	-- RequireApproval (boolean)
	if Msg.RequireApproval ~= nil then
		local string_require_approval = tostring(Msg.RequireApproval):lower()
		local new_require_approval
		if string_require_approval == 'true' then
			new_require_approval = true
		elseif string_require_approval == 'false' then
			new_require_approval = false
		else
			reply(Msg, false, { error = 'RequireApproval must be true or false' })
			return
		end
		State.Policy.RequireApproval = new_require_approval
		updates.RequireApproval = new_require_approval
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
	reply(Msg, true, { undernames = State.Owners or {} })
end)

Handlers.add('PortalRegistry.TransferSuperAdmin', function(Msg)
	if not Utils.once(Msg) then
		return
	end
	Utils.require_super_admin(Msg.From)
	local newAdmin = Msg.NewAdmin
	if not newAdmin or #newAdmin == 0 then
		reply(Msg, false, { error = 'NewAdmin tag required' })
		return
	end
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
		owners = State.Owners or {},
		requests = State.Requests,
		requestSeq = State.RequestSeq,
	})
end)
