/* eslint-disable react-hooks/exhaustive-deps */
import { Modal } from 'antd';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FieldError, Label } from '../../../../components/elements';
import { selectors as authSelectors } from '../../../../ducks/auth';
import { types } from '../../../../ducks/requisition-slips';
import { requisitionSlipTypes, quantityTypes, request } from '../../../../global/types';
import { useRequisitionSlips } from '../../../../hooks/useRequisitionSlips';
import { convertToPieces } from '../../../../utils/function';
import { CreateRequisitionSlipForm } from './CreateRequisitionSlipForm';

interface Props {
	visible: boolean;
	branchProducts: any;
	onClose: any;
	loading: boolean;
}

export const CreateRequisitionSlipModal = ({
	branchProducts,
	visible,
	onClose,
	loading,
}: Props) => {
	const user = useSelector(authSelectors.selectUser());
	const { createRequisitionSlip, status, errors, recentRequest, reset } = useRequisitionSlips();

	// Effect: Close modal if recent requests are Create, Edit or Remove
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.CREATE_REQUISITION_SLIP) {
			reset();
			onClose();
		}
	}, [status, recentRequest]);

	const onCreate = (values) => {
		const products = values.branchProducts
			.filter(({ selected }) => selected)
			.map(({ product_id, pieces_in_bulk, quantity, quantity_type }) => ({
				product_id,
				quantity_piece:
					quantity_type === quantityTypes.PIECE
						? quantity
						: convertToPieces(quantity, pieces_in_bulk),
			}));

		createRequisitionSlip({
			requestor_id: user?.branch?.id,
			requesting_user_id: user?.id,
			type: requisitionSlipTypes.MANUAL,
			products,
		});
	};

	return (
		<Modal
			className="CreateRequisitionSlipModal modal-large"
			title="[CREATE] F-RS1"
			visible={visible}
			footer={null}
			onCancel={onClose}
			centered
			closable
		>
			{errors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}

			<Label label="Products" />
			<CreateRequisitionSlipForm
				branchProducts={branchProducts}
				onSubmit={onCreate}
				onClose={onClose}
				loading={status === request.REQUESTING || loading}
			/>
		</Modal>
	);
};

CreateRequisitionSlipModal.defaultProps = {
	loading: false,
};
