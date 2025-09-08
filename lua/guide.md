## Overview
Its a Review Approval flow that allows admins to approve or reject requests for claiming undernames. The flow includes the following steps:
1. User submits a request to claim an undername.
2. Admin reviews the request and either approves or rejects it.
3. If approved, the undername is attached to the user's portal.
4. If rejected, the user is notified of the rejection.
5. The system logs the action for auditing purposes.

With this basic flow in mind, some additional considerations:
1. Maximum number of undernames a user can claim. (this could be a fixed number and admin should be able to change it)
2. Reserved undernames for certain users or groups (e.g., verified users, premium members) => map user address to a list of reserved undernames (admin can manage this list)
3. Undername format validation (e.g., no special characters, minimum/maximum length)
4. A Policy block that can have some admin rules / configs (maxPerAddr, requireApproval) => say initially admins want to allow everyone to directly claim

## Roles
1. User: requests an undername.
2. Controller: reviews requests, approves/rejects, reserves names, changes policy.

## State
1. Owners: name -> ownerAddress (the source of truth for “taken”).
2. Reserved: name -> { to?: address, by, at }
   If to matches the requester, they auto-claim on request. (this is useful for users that have names reserved for them)
3. Requests: pending/approved/rejected/cancelled items with timestamps.
4. Policy: { maxPerAddr, requireApproval }.

## Flow
1. UI will call the process to `CheckAvailability(name)` to see if the undername is available or not. (Before this do validations directly from ARNS)
2. If available, user can `RequestUndername(name)`.
    - If reserved for them, it auto-claims.
    - If not reserved and requireApproval is false, it auto-claims.
    - Otherwise, it goes to pending state.
3. Controller view can see all pending requests.
    - Approve → assign ownership and clear any reservation.
    - Reject → store reason; user stays unassigned.
4. If name reserved / already taken - show try another name message.
5. User can `CancelRequest(name)` if pending.
6. User can `ReleaseUndername(name)` if owned.
7. If User hit cap → “per-address limit reached.”

## Policy (Admin Config)
Allow for dynamic flags to be added so that the core flow can be adjusted without a lot of code changes.
Basic considerations here -
1. requireApproval:
   - true → all non-reserved requests go to review.
   - false → anyone can self-claim (still respects maxPerAddr).
2. Future-proof: add more flags without changing the flow.
3. maxPerAddr: cap on how many undernames one address can own (e.g., 1, 2, 4…).



## Commands to work with the lua file

### Super Admin

``` bash
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.Bootstrap" } }) # init the process with current caller as super admin
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.AddController", ["Addr"]="<ADDR>" } }) # add a controller replace <ADDR> with the address
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.RemoveController", ["Addr"]="<ADDR>" } }) # remove a controller replace <ADDR> with the address
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.ListControllers" } }) # list all controllers
```

### Reserved undernames (Admin action)

``` bash
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.AddReserved", ["Name"]="<UNDERNAME>", ["To"]="<ADDR>" } }) # reserve <UNDERNAME> for <ADDR> replace <UNDERNAME> and <ADDR>
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.RemoveReserved", ["Name"]="<UNDERNAME>" } }) # remove reservation for <UNDERNAME> replace <UNDERNAME>
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.ListReserved" } })
```

### Availability check (User action)

``` bash
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.CheckAvailability", ["Name"]="<UNDERNAME>" } }) # check if <UNDERNAME> is available replace <UNDERNAME>
```

### Request undername

``` bash
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.Request", ["Name"]="<UNDERNAME>" } })
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.Cancel", ["Id"]="<ID>" } })
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.Approve", ["Id"]="<ID>" } })
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.Reject", ["Id"]="<ID>", ["Reason"]="<REASON>" } })
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.ListRequests" } })
```


### Read state

``` bash
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.ListUndernames" } })
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.Audit" } })
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.Export" } })
```

### Ownership Read + Release

``` bash
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.OwnerOf", ["Name"]="<UNDERNAME>" } })
Send({ Target = ao.id, Tags = { ["Action"]="PortalRegistry.ForceRelease", ["Name"]="<UNDERNAME>", ["Reason"]="<REASON>" } })
```
