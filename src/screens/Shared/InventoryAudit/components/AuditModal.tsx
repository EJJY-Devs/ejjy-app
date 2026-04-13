import { Button, Input, message, Modal, Spin } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import { RequestErrors } from 'components';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	pageSizeOptions,
	productCheckingTypes,
	unitOfMeasurementTypes,
	QUANTITY_NON_WEIGHING_PRECISION,
	QUANTITY_WEIGHING_PRECISION,
} from 'global';
import { useAuditLogCreate, useBranchProductsForAudit } from 'hooks';
import React, { useEffect, useState } from 'react';
import { convertIntoArray } from 'utils';

interface Props {
	type: string;
	serverUrl: string;
	onClose: () => void;
}

export const AuditModal = ({ type, serverUrl, onClose }: Props) => {
	// STATES
	const [quantities, setQuantities] = useState<Record<number, string>>({});
	const [submitting, setSubmitting] = useState<Record<number, boolean>>({});
	const [page, setPage] = useState(DEFAULT_PAGE);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [searchBy, setSearchBy] = useState<'name' | 'barcode'>('name');

	useEffect(() => {
		const timeout = setTimeout(() => {
			const trimmed = searchInput.trim();
			setSearch(trimmed);
			setSearchBy(/^\d+$/.test(trimmed) ? 'barcode' : 'name');
			setPage(DEFAULT_PAGE);
		}, 500);

		return () => clearTimeout(timeout);
	}, [searchInput]);

	// CUSTOM HOOKS
	const {
		data: { branchProducts, total },
		isFetching,
	} = useBranchProductsForAudit({
		params: {
			serverUrl,
			isDailyChecked: type === productCheckingTypes.DAILY ? true : undefined,
			isRandomlyChecked:
				type === productCheckingTypes.RANDOM ? true : undefined,
			page,
			pageSize,
			search: search || undefined,
			searchBy: search ? searchBy : undefined,
		},
	});

	const { mutateAsync: createAuditLog, error: createError } = useAuditLogCreate(
		serverUrl,
	);

	// METHODS
	const handleSubmit = async (branchProduct: any) => {
		const qty = quantities[branchProduct.id];

		if (qty === undefined || qty === '') {
			message.error('Please enter a quantity.');
			return;
		}

		setSubmitting((prev) => ({ ...prev, [branchProduct.id]: true }));

		try {
			await createAuditLog({
				branchProductId: branchProduct.id,
				type: type as 'daily' | 'random',
				inputtedQty: Number(qty),
			});

			message.success(`${branchProduct.product.name} audit submitted.`);
			onClose();
		} finally {
			setSubmitting((prev) => ({ ...prev, [branchProduct.id]: false }));
		}
	};

	const columns: ColumnsType = [
		{
			title: 'Barcode',
			dataIndex: 'barcode',
			width: 180,
		},
		{
			title: 'Name',
			dataIndex: 'name',
			width: 300,
		},
		{
			title: 'Quantity',
			dataIndex: 'quantity',
			align: 'center',
			width: 140,
		},
		{
			title: 'Action',
			dataIndex: 'action',
			align: 'center',
			width: 100,
		},
	];

	const dataSource = branchProducts.map((bp) => {
		const isWeighing =
			bp.product?.unit_of_measurement === unitOfMeasurementTypes.WEIGHING;
		const precision = isWeighing
			? QUANTITY_WEIGHING_PRECISION
			: QUANTITY_NON_WEIGHING_PRECISION;
		const step = isWeighing ? 0.001 : 1;

		return {
			key: bp.id,
			barcode: bp.product?.barcode || bp.product?.selling_barcode || '—',
			name: bp.product?.name,
			quantity: (
				<Input
					min={0}
					step={step}
					type="number"
					value={quantities[bp.id] ?? ''}
					onBlur={() => {
						const val = quantities[bp.id];
						if (val === undefined || val === '') return;
						const formatted = parseFloat(val).toFixed(precision);
						setQuantities((prev) => ({ ...prev, [bp.id]: formatted }));
					}}
					onChange={(e) => {
						const val = e.target.value;
						if (!isWeighing && val.includes('.')) return;
						if (val.includes('.')) {
							const decimals = val.split('.')[1];
							if (decimals && decimals.length > precision) return;
						}
						setQuantities((prev) => ({ ...prev, [bp.id]: val }));
					}}
				/>
			),
			action: (
				<Button
					loading={submitting[bp.id]}
					type="link"
					onClick={() => handleSubmit(bp)}
				>
					Submit
				</Button>
			),
		};
	});

	const title =
		type === productCheckingTypes.DAILY ? 'Daily Audit' : 'Random Audit';

	return (
		<Modal
			className="Modal__large"
			footer={<Button onClick={onClose}>Close</Button>}
			title={title}
			centered
			closable
			visible
			onCancel={onClose}
		>
			<RequestErrors
				errors={convertIntoArray(createError?.errors)}
				withSpaceBottom
			/>

			<Input
				className="mb-4"
				placeholder="Search by barcode or name..."
				value={searchInput}
				allowClear
				onChange={(e) => setSearchInput(e.target.value)}
			/>

			<Spin spinning={isFetching}>
				<Table
					columns={columns}
					dataSource={dataSource}
					pagination={{
						current: page,
						total,
						pageSize,
						onChange: (newPage, newPageSize) => {
							setPage(newPage);
							setPageSize(newPageSize);
						},
						position: ['bottomCenter'],
						pageSizeOptions,
					}}
					bordered
				/>
			</Spin>
		</Modal>
	);
};
