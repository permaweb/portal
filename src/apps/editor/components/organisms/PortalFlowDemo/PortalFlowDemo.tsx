import * as React from 'react';
import AdminUndernamesReq, { UndernameRequest } from '../AdminUndernamesReq/AdminUndernamesReq';
import { UserReqUndernames } from '../UserReqUndernames';

export default function PortalFlowDemo() {
	// Mock state
	const [userRequests, setUserRequests] = React.useState<UndernameRequest[]>([
		{
			id: 1,
			name: 'alice_portal',
			requester: '0xAlice',
			status: 'cancelled',
			createdAt: Date.now() - 1000 * 60 * 60,
		},
		{
			id: 2,
			name: 'bob_portal',
			requester: '0xAlice',
			status: 'approved',
			createdAt: Date.now() - 1000 * 60 * 60 * 24,
			decidedAt: Date.now() - 1000 * 60 * 30,
			decidedBy: '0xController',
		},
		{
			id: 3,
			name: 'charlie_portal',
			requester: '0xAlice',
			status: 'rejected',
			createdAt: Date.now() - 1000 * 60 * 60 * 48,
			decidedAt: Date.now() - 1000 * 60 * 60,
			decidedBy: '0xController',
			reason: 'Name violates policy',
		},
	]);

	const [adminRequests, setAdminRequests] = React.useState<UndernameRequest[]>([
		{
			id: 1,
			name: 'alice_portal',
			requester: '0xAlice',
			status: 'pending',
			createdAt: Date.now() - 1000 * 60 * 60,
		},
		{
			id: 4,
			name: 'dave_portal',
			requester: '0xDave',
			status: 'pending',
			createdAt: Date.now() - 1000 * 60 * 15,
		},
	]);

	// Simulate user submit
	const handleUserSubmit = (name: string) => {
		const newReq: UndernameRequest = {
			id: Math.floor(Math.random() * 1000),
			name,
			requester: '0xAlice',
			status: 'pending',
			createdAt: Date.now(),
		};
		setUserRequests((prev) => [...prev, newReq]);
		setAdminRequests((prev) => [...prev, newReq]);
	};

	// Simulate user cancel
	const handleUserCancel = (id: number) => {
		setUserRequests((prev) =>
			prev.map((r) => (r.id === id ? { ...r, status: 'cancelled', decidedAt: Date.now(), decidedBy: '0xAlice' } : r))
		);
		setAdminRequests((prev) => prev.filter((r) => r.id !== id));
	};

	// Simulate admin approve
	const handleAdminApprove = (id: number) => {
		setAdminRequests((prev) =>
			prev.map((r) =>
				r.id === id ? { ...r, status: 'approved', decidedAt: Date.now(), decidedBy: '0xController' } : r
			)
		);
		setUserRequests((prev) =>
			prev.map((r) =>
				r.id === id ? { ...r, status: 'approved', decidedAt: Date.now(), decidedBy: '0xController' } : r
			)
		);
	};

	// Simulate admin reject
	const handleAdminReject = (id: number, reason: string) => {
		setAdminRequests((prev) =>
			prev.map((r) =>
				r.id === id ? { ...r, status: 'rejected', reason: reason, decidedAt: Date.now(), decidedBy: '0xController' } : r
			)
		);
		setUserRequests((prev) =>
			prev.map((r) =>
				r.id === id ? { ...r, status: 'rejected', reason: reason, decidedAt: Date.now(), decidedBy: '0xController' } : r
			)
		);
	};

	return (
		<div style={{ display: 'grid', gap: '32px', padding: '32px' }}>
			<UserReqUndernames
				requests={userRequests}
				isSubmitting={false}
				maxLen={20}
				validateName={(n) => (/^[a-z0-9_.-]+$/.test(n) ? null : 'Invalid characters')}
				handleSubmit={handleUserSubmit}
				handleCancel={handleUserCancel}
			/>

			<AdminUndernamesReq
				requests={adminRequests}
				handleApprove={handleAdminApprove}
				handleReject={handleAdminReject}
			/>
		</div>
	);
}
