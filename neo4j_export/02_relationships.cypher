// 关系创建语句
// 请先执行 01_nodes.cypher

MATCH (a {iri: "http://example.com/crm/transfer#TargetCustomerVerification"}), (b {iri: "http://www.w3.org/2002/07/owl#NamedIndividual"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TargetCustomerVerification"}), (b {iri: "http://example.com/crm/transfer#ProcessStep"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TargetCustomerVerification"}), (b {iri: "http://example.com/crm/transfer#CustomerLocation"})
CREATE (a)-[:HASPREDECESSORSTEP]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#usesVerificationMethod"}), (b {iri: "http://www.w3.org/2002/07/owl#ObjectProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#usesVerificationMethod"}), (b {iri: "http://example.com/crm/transfer#CustomerLocation"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#usesVerificationMethod"}), (b {iri: "http://example.com/crm/transfer#VerificationMethod"})
CREATE (a)-[:RANGE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#VerificationMethod"}), (b {iri: "http://www.w3.org/2002/07/owl#Class"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasSMSCode"}), (b {iri: "http://www.w3.org/2002/07/owl#DatatypeProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasSMSCode"}), (b {iri: "http://example.com/crm/transfer#SMSVerification"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasSMSCode"}), (b {iri: "http://www.w3.org/2001/XMLSchema#string"})
CREATE (a)-[:RANGE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasPendingOrderStatus"}), (b {iri: "http://www.w3.org/2002/07/owl#DatatypeProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasPendingOrderStatus"}), (b {iri: "http://example.com/crm/transfer#OriginalCustomer"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasPendingOrderStatus"}), (b {iri: "http://www.w3.org/2001/XMLSchema#boolean"})
CREATE (a)-[:RANGE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#ElectronicSignature"}), (b {iri: "http://www.w3.org/2002/07/owl#NamedIndividual"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#ElectronicSignature"}), (b {iri: "http://example.com/crm/transfer#ProcessStep"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#ElectronicSignature"}), (b {iri: "http://example.com/crm/transfer#TargetCustomerVerification"})
CREATE (a)-[:HASPREDECESSORSTEP]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#relatesTargetCustomer"}), (b {iri: "http://www.w3.org/2002/07/owl#ObjectProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#relatesTargetCustomer"}), (b {iri: "http://example.com/crm/transfer#TransferProcess"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#relatesTargetCustomer"}), (b {iri: "http://example.com/crm/transfer#TargetCustomer"})
CREATE (a)-[:RANGE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#OriginalCustomer"}), (b {iri: "http://www.w3.org/2002/07/owl#Class"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#OriginalCustomer"}), (b {iri: "http://example.com/crm/transfer#Customer"})
CREATE (a)-[:SUBCLASSOF]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferOrder"}), (b {iri: "http://www.w3.org/2002/07/owl#Class"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#isConstrainedBy"}), (b {iri: "http://www.w3.org/2002/07/owl#ObjectProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#isConstrainedBy"}), (b {iri: "http://example.com/crm/transfer#TransferProcess"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#isConstrainedBy"}), (b {iri: "http://example.com/crm/transfer#BusinessRule"})
CREATE (a)-[:RANGE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasBusinessNumber"}), (b {iri: "http://www.w3.org/2002/07/owl#DatatypeProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasBusinessNumber"}), (b {iri: "http://example.com/crm/transfer#Customer"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasBusinessNumber"}), (b {iri: "http://www.w3.org/2001/XMLSchema#string"})
CREATE (a)-[:RANGE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferOrder_001"}), (b {iri: "http://www.w3.org/2002/07/owl#NamedIndividual"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferOrder_001"}), (b {iri: "http://example.com/crm/transfer#TransferOrder"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferOrder_001"}), (b {iri: "http://example.com/crm/transfer#OriginalCustomer_001"})
CREATE (a)-[:INCLUDESORIGINALCUSTOMER]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferOrder_001"}), (b {iri: "http://example.com/crm/transfer#TargetCustomer_001"})
CREATE (a)-[:INCLUDESTARGETCUSTOMER]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#ArrearsRule"}), (b {iri: "http://www.w3.org/2002/07/owl#NamedIndividual"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#ArrearsRule"}), (b {iri: "http://example.com/crm/transfer#BusinessRule"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferProcess"}), (b {iri: "http://www.w3.org/2002/07/owl#Class"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#OriginalCustomer_001"}), (b {iri: "http://www.w3.org/2002/07/owl#NamedIndividual"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#OriginalCustomer_001"}), (b {iri: "http://example.com/crm/transfer#OriginalCustomer"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#Customer"}), (b {iri: "http://www.w3.org/2002/07/owl#Class"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#OrderSummaryDisplay"}), (b {iri: "http://www.w3.org/2002/07/owl#NamedIndividual"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#OrderSummaryDisplay"}), (b {iri: "http://example.com/crm/transfer#ProcessStep"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#OrderSummaryDisplay"}), (b {iri: "http://example.com/crm/transfer#ElectronicSignature"})
CREATE (a)-[:HASPREDECESSORSTEP]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#generatesTransferOrder"}), (b {iri: "http://www.w3.org/2002/07/owl#ObjectProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#generatesTransferOrder"}), (b {iri: "http://example.com/crm/transfer#TransferProcess"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#generatesTransferOrder"}), (b {iri: "http://example.com/crm/transfer#TransferOrder"})
CREATE (a)-[:RANGE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#PendingOrderRule"}), (b {iri: "http://www.w3.org/2002/07/owl#NamedIndividual"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#PendingOrderRule"}), (b {iri: "http://example.com/crm/transfer#BusinessRule"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer"}), (b {iri: "http://www.w3.org/2002/07/owl#Ontology"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#includesOriginalCustomer"}), (b {iri: "http://www.w3.org/2002/07/owl#ObjectProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#includesOriginalCustomer"}), (b {iri: "http://example.com/crm/transfer#TransferOrder"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#includesOriginalCustomer"}), (b {iri: "http://example.com/crm/transfer#OriginalCustomer"})
CREATE (a)-[:RANGE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TargetCustomer_001"}), (b {iri: "http://www.w3.org/2002/07/owl#NamedIndividual"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TargetCustomer_001"}), (b {iri: "http://example.com/crm/transfer#TargetCustomer"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#SMSVerification"}), (b {iri: "http://www.w3.org/2002/07/owl#NamedIndividual"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#SMSVerification"}), (b {iri: "http://example.com/crm/transfer#VerificationMethod"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#BusinessRule"}), (b {iri: "http://www.w3.org/2002/07/owl#Class"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasArrearsStatus"}), (b {iri: "http://www.w3.org/2002/07/owl#DatatypeProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasArrearsStatus"}), (b {iri: "http://example.com/crm/transfer#OriginalCustomer"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasArrearsStatus"}), (b {iri: "http://www.w3.org/2001/XMLSchema#boolean"})
CREATE (a)-[:RANGE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasPredecessorStep"}), (b {iri: "http://www.w3.org/2002/07/owl#ObjectProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasPredecessorStep"}), (b {iri: "http://example.com/crm/transfer#ProcessStep"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasPredecessorStep"}), (b {iri: "http://example.com/crm/transfer#ProcessStep"})
CREATE (a)-[:RANGE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferProcess_001"}), (b {iri: "http://example.com/crm/transfer#PendingOrderRule"})
CREATE (a)-[:ISCONSTRAINEDBY]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferProcess_001"}), (b {iri: "http://example.com/crm/transfer#OrderSummaryDisplay"})
CREATE (a)-[:HASPROCESSSTEP]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferProcess_001"}), (b {iri: "http://example.com/crm/transfer#TransferProcess"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferProcess_001"}), (b {iri: "http://example.com/crm/transfer#IDCardVerification"})
CREATE (a)-[:USESVERIFICATIONMETHOD]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferProcess_001"}), (b {iri: "http://example.com/crm/transfer#ElectronicSignature"})
CREATE (a)-[:HASPROCESSSTEP]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferProcess_001"}), (b {iri: "http://example.com/crm/transfer#ArrearsRule"})
CREATE (a)-[:ISCONSTRAINEDBY]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferProcess_001"}), (b {iri: "http://example.com/crm/transfer#TargetCustomer_001"})
CREATE (a)-[:RELATESTARGETCUSTOMER]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferProcess_001"}), (b {iri: "http://example.com/crm/transfer#TargetCustomerVerification"})
CREATE (a)-[:HASPROCESSSTEP]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferProcess_001"}), (b {iri: "http://example.com/crm/transfer#TransferOrder_001"})
CREATE (a)-[:GENERATESTRANSFERORDER]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferProcess_001"}), (b {iri: "http://example.com/crm/transfer#CustomerLocation"})
CREATE (a)-[:HASPROCESSSTEP]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferProcess_001"}), (b {iri: "http://example.com/crm/transfer#OriginalCustomer_001"})
CREATE (a)-[:RELATESORIGINALCUSTOMER]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TransferProcess_001"}), (b {iri: "http://www.w3.org/2002/07/owl#NamedIndividual"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#relatesOriginalCustomer"}), (b {iri: "http://www.w3.org/2002/07/owl#ObjectProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#relatesOriginalCustomer"}), (b {iri: "http://example.com/crm/transfer#TransferProcess"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#relatesOriginalCustomer"}), (b {iri: "http://example.com/crm/transfer#OriginalCustomer"})
CREATE (a)-[:RANGE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#IDCardVerification"}), (b {iri: "http://www.w3.org/2002/07/owl#NamedIndividual"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#IDCardVerification"}), (b {iri: "http://example.com/crm/transfer#VerificationMethod"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#CustomerLocation"}), (b {iri: "http://www.w3.org/2002/07/owl#NamedIndividual"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#CustomerLocation"}), (b {iri: "http://example.com/crm/transfer#ProcessStep"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#CustomerLocation"}), (b {iri: "http://www.w3.org/2002/07/owl#Nothing"})
CREATE (a)-[:HASPREDECESSORSTEP]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasIDCardNumber"}), (b {iri: "http://www.w3.org/2002/07/owl#DatatypeProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasIDCardNumber"}), (b {iri: "http://example.com/crm/transfer#Customer"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasIDCardNumber"}), (b {iri: "http://www.w3.org/2001/XMLSchema#string"})
CREATE (a)-[:RANGE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasOrderNumber"}), (b {iri: "http://www.w3.org/2002/07/owl#DatatypeProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasOrderNumber"}), (b {iri: "http://example.com/crm/transfer#TransferOrder"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasOrderNumber"}), (b {iri: "http://www.w3.org/2001/XMLSchema#string"})
CREATE (a)-[:RANGE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#ProcessStep"}), (b {iri: "http://www.w3.org/2002/07/owl#Class"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasProcessStep"}), (b {iri: "http://www.w3.org/2002/07/owl#ObjectProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasProcessStep"}), (b {iri: "http://example.com/crm/transfer#TransferProcess"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#hasProcessStep"}), (b {iri: "http://example.com/crm/transfer#ProcessStep"})
CREATE (a)-[:RANGE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TargetCustomer"}), (b {iri: "http://www.w3.org/2002/07/owl#Class"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#TargetCustomer"}), (b {iri: "http://example.com/crm/transfer#Customer"})
CREATE (a)-[:SUBCLASSOF]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#includesTargetCustomer"}), (b {iri: "http://www.w3.org/2002/07/owl#ObjectProperty"})
CREATE (a)-[:TYPE]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#includesTargetCustomer"}), (b {iri: "http://example.com/crm/transfer#TransferOrder"})
CREATE (a)-[:DOMAIN]->(b);

MATCH (a {iri: "http://example.com/crm/transfer#includesTargetCustomer"}), (b {iri: "http://example.com/crm/transfer#TargetCustomer"})
CREATE (a)-[:RANGE]->(b);

