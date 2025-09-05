local json = require('json')

State = State
	or {
		Admins = {}, -- set: address -> true  (renamed from Admins)
		Owners = {}, -- name -> ownerAddr
		Reserved = {}, -- name -> { note, by, at }
		PreallocByName = {}, -- name -> { to = addr, note = "...", at = ts, expiresAt = ts? }
		PreallocByAddr = {}, -- addr -> { [name] = true }
		Requests = {}, -- id -> request
		RequestSeq = 0,
		Policy = {
			maxPerAddr = 4,
			requireApproval = true, -- if false, anyone can self-claim (you likely keep true)
			allowAutoClaimPrealloc = true, -- prealloc skips approval
			reservedIsHardBlock = false, -- if true, reserved names cannot be approved/claimed
		},
		Audit = {},
		Processed = {},
		Bootstrapped = false,
	}

-- =========================
-- Utils
-- =========================
local Utils = {}

function Utils.normalize(name)
	assert(type(name) == 'string' and #name > 0, 'name must be non-empty string')
	local n = name:lower()
	assert(n:match('^[a-z0-9_%.-]+$'), 'invalid name: allowed [a-z0-9_%.%-]')
	return n
end

function Utils.is_admin(addr)
	return State.Admins[addr] == true
end

function Utils.require_admin(addr)
	assert(Utils.is_admin(addr), 'admin privileges required')
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
		Action = 'NameRegistry.Response',
		InReplyTo = Msg.Id,
		Data = json.encode({ ok = ok, result = result }),
	})
end
