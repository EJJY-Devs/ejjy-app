import { DownloadOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import React from 'react';

interface Props {
	src: string | null;
	title?: string;
	isOpen: boolean;
	onClose: () => void;
	onDownload?: () => void;
}

// Shows a generated PDF (blob URL) inside an in-app dialog instead of opening a
// new browser tab / Electron window, which pop-up blockers reject and which
// renders blank inside the packaged app.
export const PdfPreviewModal = ({
	src,
	title = 'PDF Preview',
	isOpen,
	onClose,
	onDownload,
}: Props) => (
	<Modal
		bodyStyle={{ padding: 0, height: '80vh' }}
		footer={
			onDownload
				? [
						<Button
							key="download"
							icon={<DownloadOutlined />}
							type="primary"
							onClick={onDownload}
						>
							Download
						</Button>,
				  ]
				: null
		}
		open={isOpen}
		title={title}
		width={900}
		centered
		destroyOnClose
		onCancel={onClose}
	>
		{src && (
			<iframe
				src={src}
				style={{ width: '100%', height: '100%', border: 'none' }}
				title={title}
			/>
		)}
	</Modal>
);
