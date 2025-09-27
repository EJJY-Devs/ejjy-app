/**
 * Background sync service for handling product synchronization
 * This ensures that product changes made via Google API are properly synced
 * with the offline bulk sync mechanism
 */

export class SyncService {
	private static instance: SyncService;

	private syncQueue: Set<string> = new Set();

	static getInstance(): SyncService {
		if (!SyncService.instance) {
			SyncService.instance = new SyncService();
		}
		return SyncService.instance;
	}

	/**
	 * Add a product ID to the sync queue
	 */
	addToSyncQueue(productId: string) {
		this.syncQueue.add(productId);
		this.processSyncQueue();
	}

	/**
	 * Process the sync queue by calling the offline bulk IDs endpoint
	 */
	private async processSyncQueue() {
		if (this.syncQueue.size === 0) return;

		try {
			// Call your offline bulk IDs endpoint to ensure sync
			await fetch('/api/offline/get-bulk-ids/', {
				method: 'GET',
				headers: {
					'Cache-Control': 'no-cache',
				},
			});

			// Clear the queue on successful sync
			this.syncQueue.clear();
			localStorage.removeItem('pendingProductSync');
		} catch (error) {
			console.error('Background sync failed:', error);
			// Retry after a delay
			setTimeout(() => this.processSyncQueue(), 5000);
		}
	}

	/**
	 * Get the current sync queue size
	 */
	getSyncQueueSize(): number {
		return this.syncQueue.size;
	}

	/**
	 * Clear the sync queue (for testing purposes)
	 */
	clearSyncQueue() {
		this.syncQueue.clear();
		localStorage.removeItem('pendingProductSync');
	}
}

export const syncService = SyncService.getInstance();

/**
 * Utility functions for sync status management
 */

export const setSyncPending = (pending = true) => {
	if (pending) {
		localStorage.setItem('pendingProductSync', 'true');
	} else {
		localStorage.removeItem('pendingProductSync');
	}
};

export const isSyncPending = (): boolean => {
	return !!localStorage.getItem('pendingProductSync');
};

export const triggerBackgroundSync = (queryClient: any, delay = 100) => {
	setTimeout(() => {
		queryClient.invalidateQueries('useOfflineBulkIds');
		queryClient.invalidateQueries('useInitializeIds');
	}, delay);
};
