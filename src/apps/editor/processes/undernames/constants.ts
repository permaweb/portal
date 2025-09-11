export const UNDERNAMES_PROCESS_ID = 'REPLACE_ME_WITH_PROCESS_ID';

export const ACTION_PREFIX = 'PortalRegistry.';

type ParamKind = 'string' | 'number' | 'boolean';

export type HandlerSpec = {
	action: string;
	params?: Record<string, ParamKind>;
};

export const UNDERNAMES_HANDLERS = {
	// Bootstrap / controllers
	Bootstrap: { action: `${ACTION_PREFIX}Bootstrap` },
	AddController: { action: `${ACTION_PREFIX}AddController`, params: { Addr: 'string' } },
	RemoveController: { action: `${ACTION_PREFIX}RemoveController`, params: { Addr: 'string' } },
	ListControllers: { action: `${ACTION_PREFIX}ListControllers` },

	// Reserved
	AddReserved: { action: `${ACTION_PREFIX}AddReserved`, params: { Name: 'string', To: 'string' } },
	RemoveReserved: { action: `${ACTION_PREFIX}RemoveReserved`, params: { Name: 'string' } },
	ListReserved: { action: `${ACTION_PREFIX}ListReserved` },

	// Availability
	CheckAvailability: { action: `${ACTION_PREFIX}CheckAvailability`, params: { Name: 'string' } },

	// Requests lifecycle
	Request: { action: `${ACTION_PREFIX}Request`, params: { Name: 'string' } },
	Cancel: { action: `${ACTION_PREFIX}Cancel`, params: { Id: 'number' } },
	Approve: { action: `${ACTION_PREFIX}Approve`, params: { Id: 'number' } },
	Reject: { action: `${ACTION_PREFIX}Reject`, params: { Id: 'number', Reason: 'string' } },

	ListRequests: {
		action: `${ACTION_PREFIX}ListRequests`,
		params: { Status: 'string', Name: 'string', Requester: 'string' },
	},

	// Ownership
	OwnerOf: { action: `${ACTION_PREFIX}OwnerOf`, params: { Name: 'string' } },
	ForceRelease: { action: `${ACTION_PREFIX}ForceRelease`, params: { Name: 'string', Reason: 'string' } },

	// Policy
	SetPolicy: { action: `${ACTION_PREFIX}SetPolicy`, params: { MaxPerAddr: 'number', RequireApproval: 'boolean' } },

	// Listings & audit/export
	ListUndernames: { action: `${ACTION_PREFIX}ListUndernames` },
	Audit: { action: `${ACTION_PREFIX}Audit` },
	Export: { action: `${ACTION_PREFIX}Export` },
} as const;

export type HandlerKey = keyof typeof UNDERNAMES_HANDLERS;
