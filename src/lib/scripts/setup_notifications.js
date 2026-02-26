/**
 * PocketBase Notifications Table Setup Script
 *
 * Run this script to create the 'notifications' collection in PocketBase.
 * Usage: node src/lib/scripts/setup_notifications.js
 *
 * Or manually create the collection in PocketBase Admin UI with these settings:
 *
 * Collection name: notifications
 * Type: Base collection
 *
 * Fields:
 * - userId     (relation -> users, required)
 * - title      (text, required, max 200)
 * - content    (text, required, max 2000)
 * - type       (select, required, values: order, promotion, system, payment, review, account)
 * - isRead     (bool, default false)
 * - link       (url, optional)
 * - extra      (json, optional)
 *
 * API Rules:
 * - List:   userId = @request.auth.id
 * - View:   userId = @request.auth.id
 * - Create: @request.auth.id != "" (or admin only)
 * - Update: userId = @request.auth.id
 * - Delete: userId = @request.auth.id
 */

import PocketBase from 'pocketbase';

const PB_URL = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'adminpassword';

async function setupNotifications() {
	const pb = new PocketBase(PB_URL);

	try {
		// Authenticate as admin
		console.log('Authenticating as admin...');
		await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
		console.log('Authenticated successfully.');

		// Check if collection already exists
		try {
			await pb.collections.getOne('notifications');
			console.log('Collection "notifications" already exists. Skipping creation.');
			return;
		} catch (e) {
			// Collection doesn't exist, create it
			console.log('Creating "notifications" collection...');
		}

		// Create the notifications collection
		const collection = await pb.collections.create({
			name: 'notifications',
			type: 'base',
			schema: [
				{
					name: 'userId',
					type: 'relation',
					required: true,
					options: {
						collectionId: '_pb_users_auth_', // default users collection ID
						cascadeDelete: true,
						minSelect: null,
						maxSelect: 1,
						displayFields: ['name', 'email']
					}
				},
				{
					name: 'title',
					type: 'text',
					required: true,
					options: {
						min: 1,
						max: 200,
						pattern: ''
					}
				},
				{
					name: 'content',
					type: 'text',
					required: true,
					options: {
						min: 1,
						max: 2000,
						pattern: ''
					}
				},
				{
					name: 'type',
					type: 'select',
					required: true,
					options: {
						maxSelect: 1,
						values: ['order', 'promotion', 'system', 'payment', 'review', 'account']
					}
				},
				{
					name: 'isRead',
					type: 'bool',
					options: {}
				},
				{
					name: 'link',
					type: 'url',
					options: {}
				},
				{
					name: 'extra',
					type: 'json',
					options: {}
				}
			],
			listRule: 'userId = @request.auth.id',
			viewRule: 'userId = @request.auth.id',
			createRule: '@request.auth.id != ""',
			updateRule: 'userId = @request.auth.id',
			deleteRule: 'userId = @request.auth.id',
			indexes: [
				'CREATE INDEX idx_notifications_userId_isRead ON notifications (userId, isRead)',
				'CREATE INDEX idx_notifications_userId_created ON notifications (userId, created DESC)'
			]
		});

		console.log('Collection "notifications" created successfully!');
		console.log('Collection ID:', collection.id);
		console.log('\nSetup complete. You can now use the notifications system.');
	} catch (error) {
		console.error('Setup failed:', error);
		process.exit(1);
	}
}

// Also export a function to seed test notifications
async function seedTestNotifications(pb, userId) {
	const testNotifications = [
		{
			userId,
			title: '注文が発送されました',
			content:
				'ご注文の商品#12345が発送されました。お届けまでもうしばらくお待ちください。追跡番号: JP1234567890',
			type: 'order',
			isRead: false,
			link: '/orders/12345'
		},
		{
			userId,
			title: '限定セール開始',
			content: '週末限定！全商品20%オフセール開催中です。お見逃しなく！',
			type: 'promotion',
			isRead: false
		},
		{
			userId,
			title: 'ポイント付与のお知らせ',
			content: '500ポイントが付与されました。次回のお買い物でご利用いただけます。',
			type: 'system',
			isRead: false
		},
		{
			userId,
			title: 'お支払い完了',
			content: '注文#12346のお支払いが正常に処理されました。',
			type: 'payment',
			isRead: true,
			link: '/orders/12346'
		},
		{
			userId,
			title: 'レビュー依頼',
			content: '購入された商品「ワイヤレスイヤホン Pro」のレビューをお待ちしています。',
			type: 'review',
			isRead: false
		},
		{
			userId,
			title: 'アカウント更新',
			content: 'プロフィール情報が正常に更新されました。',
			type: 'account',
			isRead: true
		}
	];

	for (const notification of testNotifications) {
		await pb.collection('notifications').create(notification);
	}

	console.log(`Seeded ${testNotifications.length} test notifications for user ${userId}`);
}

setupNotifications();
export { seedTestNotifications };
