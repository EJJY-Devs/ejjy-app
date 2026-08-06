export interface IProductSyncStatusMismatch {
	field: string;
	head_office_value: number;
	branch_value: number;
}

export interface IProductSyncStatus {
	id: number;
	branch_id: number;
	branch_name: string;
	product_id: number;
	product_name: string;
	status: 'in_sync' | 'mismatch' | 'not_found_on_head_office';
	current_price_per_piece: number | null;
	last_reported_datetime: string;
	sync_details: {
		mismatches?: IProductSyncStatusMismatch[];
		reason?: string;
		checked_at?: string;
	};
}
