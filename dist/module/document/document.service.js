import { prisma } from "../../lib/prisma.js";
import Handlebars from "handlebars";
import { resolveStructureStandard } from "../../utils/salaryStructureResolver.js";
export const getCompanyDataForDocumentService = async (companyId) => {
    const company = await prisma.company.findFirst({ where: { id: companyId } });
    if (!company)
        throw new Error("Company not found");
    return {
        companyName: company.name,
        companyAddress: company.address || "",
        companyPhone: company.phone || "",
        companyEmail: company.email || "",
        companyWebsite: company.website || "",
        companyLogo: company.logo || "",
    };
};
export const getEmployeeForDocumentService = async (companyId, employeeId) => {
    const employee = await prisma.employee.findFirst({
        where: { id: employeeId, companyId },
        include: {
            department: true,
            designation: true,
            employeePersonalInfo: true,
            employeeAddress: true,
            company: true,
            employeeSalaryComponents: {
                include: { salaryComponent: true },
            },
        },
    });
    if (!employee)
        throw new Error("Employee not found");
    const resolved = resolveStructureStandard(employee.employeeSalaryComponents);
    const resolvedById = new Map(resolved.map((r) => [r.componentId, r.standardAmount]));
    const earnings = employee.employeeSalaryComponents
        .filter((esc) => esc.salaryComponent.type === "EARNING")
        .map((esc) => ({
        name: esc.salaryComponent.name,
        amount: resolvedById.get(esc.salaryComponentId) ?? 0,
    }));
    const deductions = employee.employeeSalaryComponents
        .filter((esc) => esc.salaryComponent.type === "DEDUCTION")
        .map((esc) => ({
        name: esc.salaryComponent.name,
        amount: resolvedById.get(esc.salaryComponentId) ?? 0,
    }));
    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    return {
        employeeName: employee.name,
        employeeCode: employee.employeeCode || "",
        employeeEmail: employee.email,
        employeePhone: employee.phone,
        joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "",
        department: employee.department?.title || "",
        designation: employee.designation?.title || "",
        fatherName: employee.employeePersonalInfo?.fatherName || "",
        dob: employee.employeePersonalInfo?.dob ? new Date(employee.employeePersonalInfo.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "",
        gender: employee.employeePersonalInfo?.gender || "",
        nationality: employee.employeePersonalInfo?.nationality || "",
        address: employee.employeeAddress?.presentAddress || employee.employeeAddress?.permanentAddress || "",
        city: employee.employeeAddress?.city || "",
        state: employee.employeeAddress?.state || "",
        country: employee.employeeAddress?.country || "",
        companyName: employee.company.name,
        companyAddress: employee.company.address,
        companyPhone: employee.company.phone,
        companyEmail: employee.company.email,
        companyWebsite: employee.company.website || "",
        companyLogo: employee.company.logo || "",
        earnings,
        deductions,
        totalEarnings,
        totalDeductions,
    };
};
export const generateDocumentService = async (companyId, templateId, employeeId, customVariables) => {
    const template = await prisma.documentTemplate.findFirst({
        where: { id: templateId, companyId },
    });
    if (!template)
        throw new Error("Document template not found");
    let variables = {};
    if (employeeId) {
        variables = await getEmployeeForDocumentService(companyId, employeeId);
    }
    if (customVariables) {
        variables = { ...variables, ...customVariables };
    }
    const compiled = Handlebars.compile(template.htmlContent);
    const renderedHtml = compiled(variables);
    return { renderedHtml, subject: template.subject, variables };
};
export const sendDocumentEmailService = async (companyId, templateId, employeeId, recipientEmail, subject, customVariables) => {
    const { renderedHtml, subject: defaultSubject } = await generateDocumentService(companyId, templateId, employeeId, customVariables);
    const doc = await prisma.generatedDocument.create({
        data: {
            companyId,
            employeeId: employeeId || null,
            documentTemplateId: templateId,
            recipientEmail,
            subject: subject || defaultSubject,
            renderedHtml,
            sentViaEmail: true,
            sentAt: new Date(),
        },
    });
    return { document: doc, renderedHtml };
};
export const getDocumentHistoryService = async (companyId, page = 1, limit = 20, employeeId, templateId) => {
    const skip = (page - 1) * limit;
    const where = { companyId };
    if (employeeId)
        where.employeeId = employeeId;
    if (templateId)
        where.documentTemplateId = templateId;
    const [documents, total] = await Promise.all([
        prisma.generatedDocument.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            include: { employee: { select: { id: true, name: true } }, documentTemplate: { select: { id: true, name: true, category: true } } },
        }),
        prisma.generatedDocument.count({ where }),
    ]);
    return { documents, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};
