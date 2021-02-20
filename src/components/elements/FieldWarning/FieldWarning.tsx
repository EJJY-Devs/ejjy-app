import { ExclamationCircleOutlined } from '@ant-design/icons';
import cn from 'classnames';
import { FormikErrors } from 'formik';
import * as React from 'react';
import './style.scss';

interface Props {
	error: string | FormikErrors<any> | string[] | FormikErrors<any>[];
	classNames?: string;
}

const FieldWarning = ({ error, classNames }: Props) => (
	<div className={cn('FieldWarning', classNames)}>
		<ExclamationCircleOutlined className="icon" />
		<span className="text">{error}</span>
	</div>
);

export default FieldWarning;
