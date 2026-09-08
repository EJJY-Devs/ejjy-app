import { Tabs } from 'antd';
import { useQueryParams } from 'hooks';
import _ from 'lodash';
import React from 'react';
import { BranchMachine, specialDiscountCodes } from 'ejjy-global';
import { birAnnexTransactionsTabs as tabs } from 'ejjy-global/dist/components/BirAnnexTransactions/data';
import { AnnexTransactionsTab } from './AnnexTransactionsTab';
import { AnnexBirSalesSummaryTab } from './AnnexBirSalesSummaryTab';
import { VoidedInvoiceReportTab } from './VoidedInvoiceReportTab';

const VOIDED_INVOICE_REPORTS = 'Voided Invoice Reports';

type Props = {
	branchMachine: BranchMachine;
};

export const TabBirReport = ({ branchMachine }: Props) => {
	// CUSTOM HOOKS
	const {
		params: { annexTab = tabs.BIR_SALES_SUMMARY_REPORT },
		setQueryParams,
	} = useQueryParams();

	const handleTabClick = (selectedTab) => {
		setQueryParams(
			{ annexTab: selectedTab },
			{ shouldIncludeCurrentParams: true },
		);
	};

	return (
		<Tabs
			activeKey={_.toString(annexTab)}
			tabPosition="left"
			type="card"
			destroyInactiveTabPane
			onTabClick={handleTabClick}
		>
			<Tabs.TabPane
				key={tabs.BIR_SALES_SUMMARY_REPORT}
				tab={tabs.BIR_SALES_SUMMARY_REPORT}
			>
				<AnnexBirSalesSummaryTab branchMachine={branchMachine} />
			</Tabs.TabPane>

			<Tabs.TabPane
				key={tabs.NATIONAL_ATHLETES_AND_COACHES_SALES_REPORT}
				tab={tabs.NATIONAL_ATHLETES_AND_COACHES_SALES_REPORT}
			>
				<AnnexTransactionsTab
					branchMachine={branchMachine}
					category={annexTab as string}
					discountCode={specialDiscountCodes.NATIONAL_ATHLETES_AND_COACHES}
				/>
			</Tabs.TabPane>

			<Tabs.TabPane
				key={tabs.PERSONS_WITH_DISABILITY_SALES_REPORT}
				tab={tabs.PERSONS_WITH_DISABILITY_SALES_REPORT}
			>
				<AnnexTransactionsTab
					branchMachine={branchMachine}
					category={annexTab as string}
					discountCode={specialDiscountCodes.PERSONS_WITH_DISABILITY}
				/>
			</Tabs.TabPane>

			<Tabs.TabPane
				key={tabs.SENIOR_CITIZEN_SALES_REPORT}
				tab={tabs.SENIOR_CITIZEN_SALES_REPORT}
			>
				<AnnexTransactionsTab
					branchMachine={branchMachine}
					category={annexTab as string}
					discountCode={specialDiscountCodes.SENIOR_CITIZEN}
				/>
			</Tabs.TabPane>

			<Tabs.TabPane
				key={tabs.SOLO_PARENTS_SALES_REPORT}
				tab={tabs.SOLO_PARENTS_SALES_REPORT}
			>
				<AnnexTransactionsTab
					branchMachine={branchMachine}
					category={annexTab as string}
					discountCode={specialDiscountCodes.SOLO_PARENTS}
				/>
			</Tabs.TabPane>

			<Tabs.TabPane key={VOIDED_INVOICE_REPORTS} tab={VOIDED_INVOICE_REPORTS}>
				<VoidedInvoiceReportTab branchMachine={branchMachine} />
			</Tabs.TabPane>
		</Tabs>
	);
};
