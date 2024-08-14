import { TypeFromEnumValues } from "@helpers/common";
import { TransactionStatus } from "@helpers/commonEnums";
import { AuthoritiesType } from "@modules/Authorities/types";
import { ClientType } from "@modules/Client/types";
import { InvoiceTypes } from "@modules/Invoice/types";
import { ProjectTypes } from "@modules/Project/types";
import { UserTypes } from "@modules/User/types";

export type TransactionsType = {
	id: number;
	title: string;
	clientId: number;
	projectId: number;
	authorityId: number;
	amount: number;
	transactionDate: string;
	status: number;
	transactionReference: string;
	remarks: string;
	receipt: string;
	addedDate: string;
	isDeleted: boolean;
	modifiedDate: string;
	assignedToId: number;
	AssignedTo: UserTypes;
	addedById: number;
	modifiedById: number;
	Project: ProjectTypes
	Client: ClientType
	AddedBy: UserTypes;
	Authority: AuthoritiesType
	Invoice: InvoiceTypes,
	invoiceId: number,
};

export type TransactionQueryType = {
	__status: TypeFromEnumValues<typeof TransactionStatus>[],
	fromDate: string,
	toDate: string,
	projectId: number,
	clientId: number,
	authorityId: number,
	transactionReference: string,
	sortByField: string,
	sortOrder: string,
	onlyGovernmentFees: boolean,
	onlyInvoicePayments: boolean,
}