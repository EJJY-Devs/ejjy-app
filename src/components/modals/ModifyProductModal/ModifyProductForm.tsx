/* eslint-disable react/no-this-in-sfc */
import {
	Button,
	Col,
	Divider,
	Input,
	Row,
	Select,
	Typography,
	Tooltip,
} from 'antd';
import { ScrollToFieldError } from 'components';
import {
	FieldError,
	FormInput,
	FormRadioButton,
	FormSelect,
	FormattedInputNumber,
	Label,
} from 'components/elements';
import { filterOption } from 'ejjy-global';
import { ErrorMessage, Form, Formik } from 'formik';
import {
	MAX_PAGE_SIZE,
	booleanOptions,
	checkingTypesOptions,
	inputTypes,
	productCheckingTypes,
	productTypes,
	unitOfMeasurementTypes,
} from 'global';
import { useProductCategories, useSiteSettings } from 'hooks';
import { isInteger } from 'lodash';
import React, { useCallback } from 'react';
import { formatQuantity, getId } from 'utils';
import * as Yup from 'yup';

const { Text } = Typography;

const productTypeOptions = [
	{
		id: productTypes.WET,
		label: 'Wet',
		value: productTypes.WET,
	},
	{
		id: productTypes.DRY,
		label: 'Dry',
		value: productTypes.DRY,
	},
];

const unitOfMeasurementOptions = [
	{
		id: unitOfMeasurementTypes.WEIGHING,
		label: 'Weighing',
		value: unitOfMeasurementTypes.WEIGHING,
	},
	{
		id: unitOfMeasurementTypes.NON_WEIGHING,
		label: 'Non-Weighing',
		value: unitOfMeasurementTypes.NON_WEIGHING,
	},
];

const inStockOptions = [
	{
		id: 'decline',
		label: 'Decline Product',
		value: 'false',
	},
	{
		id: 'retain',
		label: 'Retain Product',
		value: 'true',
	},
];

const isVatExemptedOptions = [
	{
		id: 'vae',
		label: 'VAT-EXEMPT',
		value: 'true',
	},
	{
		id: 'vat',
		label: 'VAT',
		value: 'false',
	},
];

const isInScaleOptions = [
	{
		id: 'inScale',
		label: 'Show in Scale',
		value: 'true',
	},
	{
		id: 'notInScale',
		label: 'Hide in Scale',
		value: 'false',
	},
];

interface Props {
	isLoading: boolean;
	onClose: any;
	onSubmit: any;
	pointSystemTags: any;
	product: any;
}

export const ModifyProductForm = ({
	isLoading,
	onClose,
	onSubmit,
	pointSystemTags,
	product,
}: Props) => {
	// CUSTOM HOOKS
	const { data: siteSettings } = useSiteSettings();
	const {
		data: { productCategories },
	} = useProductCategories({
		params: {
			pageSize: MAX_PAGE_SIZE,
		},
	});

	// METHODS
	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				allowableSpoilage: product?.allowable_spoilage || 0.1,
				barcode: product?.barcode || '',
				sellingBarcode: product?.selling_barcode || '',
				packingBarcode: product?.packing_barcode || '',
				description: product?.description || '',
				hasQuantityAllowance: product?.has_quantity_allowance || false,
				isShownInScaleList: String(product?.is_shown_in_scale_list ?? false),
				checking: productCheckingTypes.RANDOM,
				isSoldInBranch: 'true',
				isVatExempted: (!!product?.is_vat_exempted).toString(),
				maxBalance: product?.max_balance
					? formatQuantity({
							unitOfMeasurement: product?.unit_of_measurement,
							quantity: product.max_balance,
					  })
					: '',
				name: product?.name || '',
				piecesInBulk: product?.pieces_in_bulk || 1,
				conversionAmount: product?.conversion_amount || 1,
				pointSystemTagId: getId(product?.point_system_tag),
				costPerBulk: product?.cost_per_bulk || 1,
				costPerPiece: product?.cost_per_piece || '',
				pricePerBulk: product?.price_per_bulk || 1,
				pricePerPiece: product?.price_per_piece || '',
				specialPrice: product?.special_price || '',
				creditPrice: product?.credit_price || '',
				wholeSalePrice: product?.wholesale_price || '',
				poPrice: product?.credit_price || '',

				printDetails: product?.print_details || '',
				priceTagPrintDetails: product?.price_tag_print_details || '',
				productCategory:
					product?.product_category === 'None'
						? null
						: product?.product_category,
				reorderPoint: product?.reorder_point
					? formatQuantity({
							unitOfMeasurement: product.unit_of_measurement,
							quantity: product.reorder_point,
					  })
					: '',
				textcode: product?.textcode || '',
				type: product?.type || productTypes.WET,
				unitOfMeasurement:
					product?.unit_of_measurement === 'non_weighing'
						? unitOfMeasurementTypes.NON_WEIGHING
						: product?.selling_barcode_unit_of_measurement ||
						  unitOfMeasurementTypes.NON_WEIGHING,
				sellingBarcodeUnitOfMeasurement:
					product?.unit_of_measurement === 'weighing'
						? unitOfMeasurementTypes.WEIGHING
						: product?.selling_barcode_unit_of_measurement ||
						  unitOfMeasurementTypes.WEIGHING,
				packingBarcodeUnitOfMeasurement:
					product?.packing_barcode_unit_of_measurement ||
					unitOfMeasurementTypes.NON_WEIGHING,
			},
			Schema: Yup.object().shape(
				{
					textcode: Yup.string().max(50),
					barcode: Yup.string().max(50).label('Barcode'),
					name: Yup.string().required().max(70).label('Name').trim(),
					type: Yup.string().label('TT-001'),
					unitOfMeasurement: Yup.string().label('unitOfMeasurement'),
					productCategory: Yup.string().label('Product Category'),
					printDetails: Yup.string()
						.required()
						.label('Print Details (Receipt)')
						.trim(),
					priceTagPrintDetails: Yup.string()
						.required()
						.label('Print Details (Price Tag)')
						.trim(),
					reorderPoint: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.test(
							'is-whole-number',
							'Non-weighing items require whole number quantity.',
							function test(value) {
								// NOTE: We need to use a no-named function so
								// we can use 'this' and access the other form field value.
								const { unitOfMeasurement } = this.parent;
								return unitOfMeasurement === unitOfMeasurementTypes.NON_WEIGHING
									? isInteger(Number(value))
									: true;
							},
						)
						.label('Reorder Point'),
					maxBalance: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.test(
							'is-whole-number',
							'Non-weighing items require whole number quantity.',
							function test(value) {
								// NOTE: We need to use a no-named function so
								// we can use 'this' and access the other form field value.
								const { unitOfMeasurement } = this.parent;
								return unitOfMeasurement === unitOfMeasurementTypes.NON_WEIGHING
									? isInteger(Number(value))
									: true;
							},
						)
						.label('Max Balance'),
					costPerPiece: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.label('Cost per Piece'),
					// costPerBulk: Yup.number()
					// 	.required()
					// 	.moreThan(0)
					// 	.nullable()
					// 	.label('Cost Per Bulk'),
					pricePerPiece: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.label('Regular Price'),
					// pricePerBulk: Yup.number()
					// 	.required()
					// 	.moreThan(0)
					// 	.nullable()
					// 	.label('Regular Price (Bulk)'),
					creditPrice: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.label('Credit Price'),
					wholeSalePrice: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.label('Wholesale Price'),
					specialPrice: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.label('Special Price'),
					poPrice: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.label('PO Price'),
					pointSystemTagId: Yup.string().nullable().label('Point System Tag'),
				},
				[['barcode', 'textcode']],
			),
		}),
		[product, siteSettings],
	);

	const renderInputField = ({
		name,
		label,
		type = inputTypes.TEXT,
		values,
		setFieldValue,
		options = {},
	}) => (
		<>
			<Label id={name} label={label} spacing />
			{[inputTypes.TEXT, inputTypes.NUMBER].includes(type) && (
				<Input
					name={name}
					type={type}
					value={values[name]}
					onChange={(e) => {
						setFieldValue(name, e.target.value);
					}}
					{...options}
				/>
			)}
			{type === inputTypes.TEXTAREA && (
				<Input.TextArea
					name={name}
					value={values[name]}
					onChange={(e) => {
						setFieldValue(name, e.target.value);
					}}
					{...options}
				/>
			)}
			{type === inputTypes.MONEY && (
				<FormattedInputNumber
					className="w-100"
					controls={false}
					value={values[name]}
					onChange={(value) => {
						setFieldValue(name, value);
					}}
					{...options}
				/>
			)}
			<ErrorMessage
				name={name}
				render={(error) => <FieldError error={error} />}
			/>
		</>
	);

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			enableReinitialize
			onSubmit={async (formData) => {
				const data = {
					...formData,
				};

				onSubmit(data);
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					<ScrollToFieldError />

					<Row gutter={[16, 16]}>
						<Col sm={12} span={24}>
							{renderInputField({
								name: 'barcode',
								label: 'Barcode',
								setFieldValue,
								values,
							})}

							<Tooltip title="Note">
								<span style={{ color: 'grey' }}>
									Note: Products tagged as &quot;WEIGHING&quot; must only have 7
									digit barcode.
								</span>
							</Tooltip>
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'textcode',
								label: 'SKU/Textcode',
								setFieldValue,
								values,
							})}
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'name',
								label: 'Product Name',
								setFieldValue,
								values,
							})}
						</Col>

						<Col sm={12} span={24}>
							<Label label="&nbsp;" spacing />
							<FormRadioButton
								id="unitOfMeasurement"
								items={unitOfMeasurementOptions}
							/>
							<ErrorMessage
								name="unitOfMeasurement"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'printDetails',
								label: 'Print Details (Receipt)',
								setFieldValue,
								values,
							})}
						</Col>

						<Col sm={12} span={24}>
							<Label label="&nbsp;" spacing />
							<FormRadioButton
								id="isShownInScaleList"
								items={isInScaleOptions}
							/>
							<ErrorMessage
								name="isShownInScaleList"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'priceTagPrintDetails',
								label: 'Print Details (Price Tag)',
								setFieldValue,
								values,
								type: inputTypes.TEXTAREA,
								options: {
									autoSize: { minRows: 1, maxRows: 2 },
								},
							})}
						</Col>

						<Col sm={12} span={24}>
							<Label label="&nbsp;" spacing />
							<FormRadioButton
								id="isVatExempted"
								items={isVatExemptedOptions}
							/>
							<ErrorMessage
								name="isVatExempted"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							<Label label="Product Category" spacing />
							<Select
								className="w-100"
								id="productCategory"
								value={values.productCategory}
								onChange={(value) => {
									setFieldValue('productCategory', value);
								}}
								allowClear
								placeholder="None"
							>
								{productCategories.map((productCategory) => (
									<Select.Option
										key={productCategory.name}
										value={productCategory.name}
									>
										{productCategory.name}
									</Select.Option>
								))}
							</Select>
							<ErrorMessage
								name="productCategory"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							<Label id="pointSystemTagId" label="Loyalty Program" spacing />
							<Select
								className="w-100"
								filterOption={filterOption}
								optionFilterProp="children"
								value={values.pointSystemTagId}
								allowClear
								placeholder="None"
								showSearch
								onChange={(value) => {
									setFieldValue('pointSystemTagId', value);
								}}
							>
								{pointSystemTags.map((pointSystemTag) => (
									<Select.Option
										key={pointSystemTag.id}
										value={getId(pointSystemTag)}
									>
										{pointSystemTag.name}
									</Select.Option>
								))}
							</Select>
							<ErrorMessage
								name="pointSystemTagId"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							<Label label="&nbsp;" spacing />
							<FormRadioButton id="isSoldInBranch" items={inStockOptions} />
							<ErrorMessage
								name="isSoldInBranch"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							<Label label="&nbsp;" spacing />
							<FormRadioButton
								id="checking"
								items={checkingTypesOptions}
								onChange={(value) => {
									setFieldValue(
										'isDailyChecked',
										value === productCheckingTypes.DAILY,
									);
									setFieldValue(
										'isRandomlyChecked',
										value === productCheckingTypes.RANDOM,
									);
								}}
							/>
							<ErrorMessage
								name="checking"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Divider dashed>QUANTITY</Divider>

						<Col sm={12} span={24}>
							<Label label="Reorder Point" spacing />
							<FormInput
								id="reorderPoint"
								isWholeNumber={
									values.unitOfMeasurement ===
									unitOfMeasurementTypes.NON_WEIGHING
								}
								type="number"
							/>
							<ErrorMessage
								name="reorderPoint"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							<Label label="Max Balance" spacing />
							<FormInput
								id="maxBalance"
								isWholeNumber={
									values.unitOfMeasurement ===
									unitOfMeasurementTypes.NON_WEIGHING
								}
								type="number"
							/>
							<ErrorMessage
								name="maxBalance"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Divider dashed>
							PRICES
							<br />
							<Text mark>(must be in 2 decimal places)</Text>
						</Divider>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'costPerPiece',
								label: 'Cost',
								setFieldValue,
								values,
								type: inputTypes.MONEY,
							})}
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'wholeSalePrice',
								label: 'Wholesale Price',
								setFieldValue,
								values,
								type: inputTypes.MONEY,
							})}
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'pricePerPiece',
								label: 'Regular Price',
								setFieldValue: (field, value) => {
									setFieldValue(field, value);
									// Update other prices to follow the regular price
									setFieldValue('wholeSalePrice', value);
									setFieldValue('specialPrice', value);
									setFieldValue('creditPrice', value);
									setFieldValue('poPrice', value);
								},
								values,
								type: inputTypes.MONEY,
							})}
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'specialPrice',
								label: 'Special Price',
								setFieldValue,
								values,
								type: inputTypes.MONEY,
							})}
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'creditPrice',
								label: 'Credit Price',
								setFieldValue,
								values,
								type: inputTypes.MONEY,
							})}
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'poPrice',
								label: 'PO Price',
								setFieldValue,
								values,
								type: inputTypes.MONEY,
							})}
						</Col>
					</Row>

					<div className="ModalCustomFooter">
						<Button disabled={isLoading} htmlType="button" onClick={onClose}>
							Cancel
						</Button>
						<Button htmlType="submit" loading={isLoading} type="primary">
							{product ? 'Edit' : 'Create'}
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};
