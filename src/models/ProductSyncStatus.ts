export interface IProductSyncStatus {
	branch_id: number;
	branch_name: string;
	product_id: number;
	product_name: string;
	expected_price_per_piece: number | null;
	current_price_per_piece: number | null;
	is_synced: boolean;
	last_reported_datetime: string;
	sync_details: any;
}
