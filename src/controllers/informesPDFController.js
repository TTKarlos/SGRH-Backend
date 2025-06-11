const PDFDocument = require("pdfkit")
const { Op } = require("sequelize")
const PDFStyles = require("../utils/pdfStyles")
const Empleado = require("../models/Empleado")
const Departamento = require("../models/Departamento")
const Centro = require("../models/Centro")
const Zona = require("../models/Zona")
const Empresa = require("../models/Empresa")
const Contrato = require("../models/Contrato")
Empleado.belongsTo(Departamento, { foreignKey: "id_departamento" })
Empleado.belongsTo(Centro, { foreignKey: "id_centro" })
Departamento.belongsTo(Centro, { foreignKey: "id_centro" })
Centro.belongsTo(Zona, { foreignKey: "id_zona" })
Contrato.belongsTo(Empleado, { foreignKey: "id_empleado" })
Contrato.belongsTo(Empresa, { foreignKey: "id_empresa" })

class InformesPDFController {

    static handlePDFError(res, error, message) {
        console.error(message, error)

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: message,
                error: error.message,
            })
        }
    }

    static finalizePDF(doc) {
        PDFStyles.addFooter(doc)
        doc.end()
    }

    // ========================================
    // INFORMES PRINCIPALES
    // ========================================

    static async todosLosEmpleados(req, res) {
        try {
            const empleados = await Empleado.findAll({
                include: [
                    { model: Departamento, attributes: ["nombre"] },
                    {
                        model: Centro,
                        attributes: ["nombre"],
                        include: [{ model: Zona, attributes: ["nombre"] }],
                    },
                ],
                order: [
                    ["apellidos", "ASC"],
                    ["nombre", "ASC"],
                ],
            })

            const doc = new PDFDocument(PDFStyles.getBaseConfig())
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", 'inline; filename="todos_los_empleados.pdf"')
            doc.pipe(res)

            let currentY = PDFStyles.addHeader(
                doc,
                "Listado Completo de Empleados",
                `Total de empleados en el sistema: ${empleados.length}`,
            )

            const headers = ["Nombre Completo", "DNI/NIE", "Departamento", "Centro", "Zona", "Puesto", "Estado"]
            const data = empleados.map((emp) => [
                `${emp.apellidos}, ${emp.nombre}`,
                emp.dni_nie,
                emp.Departamento?.nombre || "Sin asignar",
                emp.Centro?.nombre || "Sin asignar",
                emp.Centro?.Zona?.nombre || "Sin asignar",
                emp.puesto_actual || "Sin definir",
                emp.activo ? "Activo" : "Inactivo",
            ])

            currentY = PDFStyles.createTable(doc, headers, data, currentY)

            const activos = empleados.filter((e) => e.activo).length
            const resumen = [
                { label: "Total empleados", value: empleados.length },
                { label: "Empleados activos", value: activos },
                { label: "Empleados inactivos", value: empleados.length - activos },
                { label: "Porcentaje activos", value: `${((activos / empleados.length) * 100).toFixed(1)}%` },
            ]

            PDFStyles.addSummary(doc, resumen, currentY)
            InformesPDFController.finalizePDF(doc)
        } catch (error) {
            InformesPDFController.handlePDFError(res, error, "Error generando informe de todos los empleados")
        }
    }

    static async empleadosActivos(req, res) {
        try {
            const empleados = await Empleado.findAll({
                where: { activo: true },
                include: [
                    { model: Departamento, attributes: ["nombre"] },
                    { model: Centro, attributes: ["nombre"] },
                ],
                order: [
                    ["apellidos", "ASC"],
                    ["nombre", "ASC"],
                ],
            })

            const doc = new PDFDocument(PDFStyles.getBaseConfig())
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", 'inline; filename="empleados_activos.pdf"')
            doc.pipe(res)

            let currentY = PDFStyles.addHeader(doc, "Empleados Activos", `Total: ${empleados.length} empleados activos`)

            const headers = ["Nombre Completo", "DNI/NIE", "Departamento", "Centro", "Puesto", "Teléfono", "Email"]
            const data = empleados.map((emp) => [
                `${emp.apellidos}, ${emp.nombre}`,
                emp.dni_nie,
                emp.Departamento?.nombre || "Sin asignar",
                emp.Centro?.nombre || "Sin asignar",
                emp.puesto_actual || "Sin definir",
                emp.telefono || "N/A",
                emp.email || "N/A",
            ])

            currentY = PDFStyles.createTable(doc, headers, data, currentY)

            const resumen = [
                { label: "Total empleados activos", value: empleados.length },
                { label: "Con departamento asignado", value: empleados.filter((e) => e.Departamento).length },
                { label: "Con centro asignado", value: empleados.filter((e) => e.Centro).length },
                { label: "Con teléfono registrado", value: empleados.filter((e) => e.telefono).length },
                { label: "Con email registrado", value: empleados.filter((e) => e.email).length },
            ]

            PDFStyles.addSummary(doc, resumen, currentY)
            InformesPDFController.finalizePDF(doc)
        } catch (error) {
            InformesPDFController.handlePDFError(res, error, "Error generando informe de empleados activos")
        }
    }

    static async empleadosInactivos(req, res) {
        try {
            const empleados = await Empleado.findAll({
                where: { activo: false },
                include: [
                    { model: Departamento, attributes: ["nombre"] },
                    { model: Centro, attributes: ["nombre"] },
                ],
                order: [
                    ["apellidos", "ASC"],
                    ["nombre", "ASC"],
                ],
            })

            const doc = new PDFDocument(PDFStyles.getBaseConfig())
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", 'inline; filename="empleados_inactivos.pdf"')
            doc.pipe(res)

            let currentY = PDFStyles.addHeader(doc, "Empleados Inactivos", `Total: ${empleados.length} empleados inactivos`)

            const headers = ["Nombre Completo", "DNI/NIE", "Departamento", "Centro", "Último Puesto", "Fecha Baja", "Motivo"]
            const data = empleados.map((emp) => [
                `${emp.apellidos}, ${emp.nombre}`,
                emp.dni_nie,
                emp.Departamento?.nombre || "Sin asignar",
                emp.Centro?.nombre || "Sin asignar",
                emp.puesto_actual || "Sin definir",
                PDFStyles.formatDate(emp.fecha_baja),
                emp.motivo_baja || "No especificado",
            ])

            currentY = PDFStyles.createTable(doc, headers, data, currentY)

            const resumen = [
                { label: "Total empleados inactivos", value: empleados.length },
                { label: "Con fecha de baja registrada", value: empleados.filter((e) => e.fecha_baja).length },
                { label: "Con motivo de baja especificado", value: empleados.filter((e) => e.motivo_baja).length },
                { label: "Con departamento asignado", value: empleados.filter((e) => e.Departamento).length },
            ]

            PDFStyles.addSummary(doc, resumen, currentY)
            InformesPDFController.finalizePDF(doc)
        } catch (error) {
            InformesPDFController.handlePDFError(res, error, "Error generando informe de empleados inactivos")
        }
    }

    // ========================================
    // INFORMES POR DEPARTAMENTO
    // ========================================

    static async empleadosPorDepartamentoGeneral(req, res) {
        try {
            const empleados = await Empleado.findAll({
                include: [
                    { model: Departamento, attributes: ["nombre"] },
                    { model: Centro, attributes: ["nombre"] },
                ],
                order: [
                    [Departamento, "nombre", "ASC"],
                    ["apellidos", "ASC"],
                    ["nombre", "ASC"],
                ],
            })

            const doc = new PDFDocument(PDFStyles.getBaseConfig())
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", 'inline; filename="empleados_todos_departamentos.pdf"')
            doc.pipe(res)

            let currentY = PDFStyles.addHeader(
                doc,
                "Empleados por Departamento - Todos",
                `Total: ${empleados.length} empleados en todos los departamentos`,
            )

            const headers = ["Nombre Completo", "DNI/NIE", "Departamento", "Centro", "Puesto", "Estado", "Email"]
            const data = empleados.map((emp) => [
                `${emp.apellidos}, ${emp.nombre}`,
                emp.dni_nie,
                emp.Departamento?.nombre || "Sin asignar",
                emp.Centro?.nombre || "Sin asignar",
                emp.puesto_actual || "Sin definir",
                emp.activo ? "Activo" : "Inactivo",
                emp.email || "N/A",
            ])

            currentY = PDFStyles.createTable(doc, headers, data, currentY)

            const departamentos = {}
            empleados.forEach((emp) => {
                const depNombre = emp.Departamento?.nombre || "Sin asignar"
                if (!departamentos[depNombre]) {
                    departamentos[depNombre] = { total: 0, activos: 0 }
                }
                departamentos[depNombre].total++
                if (emp.activo) departamentos[depNombre].activos++
            })

            const resumen = [
                { label: "Total empleados", value: empleados.length },
                { label: "Empleados activos", value: empleados.filter((e) => e.activo).length },
                { label: "Departamentos diferentes", value: Object.keys(departamentos).length },
                { label: "Con email registrado", value: empleados.filter((e) => e.email).length },
            ]

            PDFStyles.addSummary(doc, resumen, currentY)
            InformesPDFController.finalizePDF(doc)
        } catch (error) {
            InformesPDFController.handlePDFError(res, error, "Error generando informe general por departamentos")
        }
    }

    static async empleadosPorDepartamentoEspecifico(req, res) {
        try {
            const { id } = req.params

            const departamento = await Departamento.findByPk(id)
            if (!departamento) {
                return res.status(404).json({
                    success: false,
                    message: "Departamento no encontrado",
                })
            }

            const empleados = await Empleado.findAll({
                where: { id_departamento: id },
                include: [
                    { model: Departamento, attributes: ["nombre"] },
                    { model: Centro, attributes: ["nombre"] },
                ],
                order: [
                    ["apellidos", "ASC"],
                    ["nombre", "ASC"],
                ],
            })

            const doc = new PDFDocument(PDFStyles.getBaseConfig())
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", `inline; filename="empleados_departamento_${id}.pdf"`)
            doc.pipe(res)

            let currentY = PDFStyles.addHeader(
                doc,
                `Empleados del Departamento: ${departamento.nombre}`,
                `Total: ${empleados.length} empleados`,
            )

            const headers = ["Nombre Completo", "DNI/NIE", "Centro", "Puesto", "Estado", "Email", "Teléfono"]
            const data = empleados.map((emp) => [
                `${emp.apellidos}, ${emp.nombre}`,
                emp.dni_nie,
                emp.Centro?.nombre || "Sin asignar",
                emp.puesto_actual || "Sin definir",
                emp.activo ? "Activo" : "Inactivo",
                emp.email || "N/A",
                emp.telefono || "N/A",
            ])

            currentY = PDFStyles.createTable(doc, headers, data, currentY)

            const resumen = [
                { label: "Departamento", value: departamento.nombre },
                { label: "Total empleados", value: empleados.length },
                { label: "Empleados activos", value: empleados.filter((e) => e.activo).length },
                { label: "Empleados inactivos", value: empleados.filter((e) => !e.activo).length },
                { label: "Con email registrado", value: empleados.filter((e) => e.email).length },
            ]

            PDFStyles.addSummary(doc, resumen, currentY)
            InformesPDFController.finalizePDF(doc)
        } catch (error) {
            InformesPDFController.handlePDFError(res, error, "Error generando informe específico por departamento")
        }
    }

    // ========================================
    // INFORMES POR CENTRO
    // ========================================

    static async empleadosPorCentroGeneral(req, res) {
        try {
            const empleados = await Empleado.findAll({
                include: [
                    { model: Departamento, attributes: ["nombre"] },
                    {
                        model: Centro,
                        attributes: ["nombre", "direccion"],
                        include: [{ model: Zona, attributes: ["nombre"] }],
                    },
                ],
                order: [
                    [Centro, "nombre", "ASC"],
                    ["apellidos", "ASC"],
                    ["nombre", "ASC"],
                ],
            })

            const doc = new PDFDocument(PDFStyles.getBaseConfig())
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", 'inline; filename="empleados_todos_centros.pdf"')
            doc.pipe(res)

            let currentY = PDFStyles.addHeader(
                doc,
                "Empleados por Centro - Todos",
                `Total: ${empleados.length} empleados en todos los centros`,
            )

            const headers = ["Nombre Completo", "DNI/NIE", "Centro", "Zona", "Departamento", "Puesto", "Estado"]
            const data = empleados.map((emp) => [
                `${emp.apellidos}, ${emp.nombre}`,
                emp.dni_nie,
                emp.Centro?.nombre || "Sin asignar",
                emp.Centro?.Zona?.nombre || "Sin asignar",
                emp.Departamento?.nombre || "Sin asignar",
                emp.puesto_actual || "Sin definir",
                emp.activo ? "Activo" : "Inactivo",
            ])

            currentY = PDFStyles.createTable(doc, headers, data, currentY)

            const resumen = [
                { label: "Total empleados", value: empleados.length },
                { label: "Empleados activos", value: empleados.filter((e) => e.activo).length },
                { label: "Con centro asignado", value: empleados.filter((e) => e.Centro).length },
                {
                    label: "Centros diferentes",
                    value: [...new Set(empleados.map((e) => e.Centro?.nombre).filter(Boolean))].length,
                },
            ]

            PDFStyles.addSummary(doc, resumen, currentY)
            InformesPDFController.finalizePDF(doc)
        } catch (error) {
            InformesPDFController.handlePDFError(res, error, "Error generando informe general por centros")
        }
    }

    static async empleadosPorCentroEspecifico(req, res) {
        try {
            const { id } = req.params

            const centro = await Centro.findByPk(id, {
                include: [{ model: Zona, attributes: ["nombre"] }],
            })

            if (!centro) {
                return res.status(404).json({
                    success: false,
                    message: "Centro no encontrado",
                })
            }

            const empleados = await Empleado.findAll({
                where: { id_centro: id },
                include: [
                    { model: Departamento, attributes: ["nombre"] },
                    {
                        model: Centro,
                        attributes: ["nombre", "direccion"],
                        include: [{ model: Zona, attributes: ["nombre"] }],
                    },
                ],
                order: [
                    ["apellidos", "ASC"],
                    ["nombre", "ASC"],
                ],
            })

            const doc = new PDFDocument(PDFStyles.getBaseConfig())
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", `inline; filename="empleados_centro_${id}.pdf"`)
            doc.pipe(res)

            let currentY = PDFStyles.addHeader(
                doc,
                `Empleados del Centro: ${centro.nombre}`,
                `Zona: ${centro.Zona?.nombre || "Sin zona"} | Total: ${empleados.length} empleados`,
            )

            const headers = ["Nombre Completo", "DNI/NIE", "Departamento", "Puesto", "Estado", "Email", "Teléfono"]
            const data = empleados.map((emp) => [
                `${emp.apellidos}, ${emp.nombre}`,
                emp.dni_nie,
                emp.Departamento?.nombre || "Sin asignar",
                emp.puesto_actual || "Sin definir",
                emp.activo ? "Activo" : "Inactivo",
                emp.email || "N/A",
                emp.telefono || "N/A",
            ])

            currentY = PDFStyles.createTable(doc, headers, data, currentY)

            const resumen = [
                { label: "Centro", value: centro.nombre },
                { label: "Zona", value: centro.Zona?.nombre || "Sin zona" },
                { label: "Dirección", value: centro.direccion || "No especificada" },
                { label: "Total empleados", value: empleados.length },
                { label: "Empleados activos", value: empleados.filter((e) => e.activo).length },
            ]

            PDFStyles.addSummary(doc, resumen, currentY)
            InformesPDFController.finalizePDF(doc)
        } catch (error) {
            InformesPDFController.handlePDFError(res, error, "Error generando informe específico por centro")
        }
    }

    // ========================================
    // INFORMES POR ZONA
    // ========================================

    static async empleadosPorZonaGeneral(req, res) {
        try {
            const empleados = await Empleado.findAll({
                include: [
                    { model: Departamento, attributes: ["nombre"] },
                    {
                        model: Centro,
                        attributes: ["nombre"],
                        include: [{ model: Zona, attributes: ["nombre", "descripcion"] }],
                    },
                ],
                order: [
                    [Centro, Zona, "nombre", "ASC"],
                    [Centro, "nombre", "ASC"],
                    ["apellidos", "ASC"],
                    ["nombre", "ASC"],
                ],
            })

            const doc = new PDFDocument(PDFStyles.getBaseConfig())
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", 'inline; filename="empleados_todas_zonas.pdf"')
            doc.pipe(res)

            let currentY = PDFStyles.addHeader(
                doc,
                "Empleados por Zona - Todas",
                `Total: ${empleados.length} empleados en todas las zonas`,
            )

            const headers = ["Nombre Completo", "DNI/NIE", "Zona", "Centro", "Departamento", "Puesto", "Estado"]
            const data = empleados.map((emp) => [
                `${emp.apellidos}, ${emp.nombre}`,
                emp.dni_nie,
                emp.Centro?.Zona?.nombre || "Sin asignar",
                emp.Centro?.nombre || "Sin asignar",
                emp.Departamento?.nombre || "Sin asignar",
                emp.puesto_actual || "Sin definir",
                emp.activo ? "Activo" : "Inactivo",
            ])

            currentY = PDFStyles.createTable(doc, headers, data, currentY)

            const resumen = [
                { label: "Total empleados", value: empleados.length },
                { label: "Empleados activos", value: empleados.filter((e) => e.activo).length },
                {
                    label: "Zonas diferentes",
                    value: [...new Set(empleados.map((e) => e.Centro?.Zona?.nombre).filter(Boolean))].length,
                },
                {
                    label: "Centros diferentes",
                    value: [...new Set(empleados.map((e) => e.Centro?.nombre).filter(Boolean))].length,
                },
            ]

            PDFStyles.addSummary(doc, resumen, currentY)
            InformesPDFController.finalizePDF(doc)
        } catch (error) {
            InformesPDFController.handlePDFError(res, error, "Error generando informe general por zonas")
        }
    }

    static async empleadosPorZonaEspecifica(req, res) {
        try {
            const { id } = req.params

            const zona = await Zona.findByPk(id)
            if (!zona) {
                return res.status(404).json({
                    success: false,
                    message: "Zona no encontrada",
                })
            }

            const empleados = await Empleado.findAll({
                include: [
                    { model: Departamento, attributes: ["nombre"] },
                    {
                        model: Centro,
                        attributes: ["nombre"],
                        where: { id_zona: id },
                        include: [{ model: Zona, attributes: ["nombre", "descripcion"] }],
                    },
                ],
                order: [
                    [Centro, "nombre", "ASC"],
                    ["apellidos", "ASC"],
                    ["nombre", "ASC"],
                ],
            })

            const doc = new PDFDocument(PDFStyles.getBaseConfig())
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", `inline; filename="empleados_zona_${id}.pdf"`)
            doc.pipe(res)

            let currentY = PDFStyles.addHeader(
                doc,
                `Empleados de la Zona: ${zona.nombre}`,
                `${zona.descripcion || ""} | Total: ${empleados.length} empleados`,
            )

            const headers = ["Nombre Completo", "DNI/NIE", "Centro", "Departamento", "Puesto", "Estado", "Email"]
            const data = empleados.map((emp) => [
                `${emp.apellidos}, ${emp.nombre}`,
                emp.dni_nie,
                emp.Centro?.nombre || "Sin asignar",
                emp.Departamento?.nombre || "Sin asignar",
                emp.puesto_actual || "Sin definir",
                emp.activo ? "Activo" : "Inactivo",
                emp.email || "N/A",
            ])

            currentY = PDFStyles.createTable(doc, headers, data, currentY)

            const centrosEnZona = [...new Set(empleados.map((e) => e.Centro?.nombre).filter(Boolean))]

            const resumen = [
                { label: "Zona", value: zona.nombre },
                { label: "Descripción", value: zona.descripcion || "No especificada" },
                { label: "Total empleados", value: empleados.length },
                { label: "Empleados activos", value: empleados.filter((e) => e.activo).length },
                { label: "Centros en esta zona", value: centrosEnZona.length },
            ]

            PDFStyles.addSummary(doc, resumen, currentY)
            InformesPDFController.finalizePDF(doc)
        } catch (error) {
            InformesPDFController.handlePDFError(res, error, "Error generando informe específico por zona")
        }
    }

    // ========================================
    // INFORMES POR EMPRESA
    // ========================================

    static async empleadosPorEmpresaGeneral(req, res) {
        try {
            const contratos = await Contrato.findAll({
                include: [
                    {
                        model: Empleado,
                        attributes: ["nombre", "apellidos", "dni_nie", "puesto_actual", "activo"],
                        include: [
                            { model: Departamento, attributes: ["nombre"] },
                            { model: Centro, attributes: ["nombre"] },
                        ],
                    },
                    { model: Empresa, attributes: ["nombre", "cif"] },
                ],
                order: [
                    [Empresa, "nombre", "ASC"],
                    [Empleado, "apellidos", "ASC"],
                    [Empleado, "nombre", "ASC"],
                ],
            })

            const doc = new PDFDocument(PDFStyles.getBaseConfig())
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", 'inline; filename="empleados_todas_empresas.pdf"')
            doc.pipe(res)

            let currentY = PDFStyles.addHeader(doc, "Empleados por Empresa - Todas", `Total contratos: ${contratos.length}`)

            const headers = ["Empleado", "DNI/NIE", "Empresa", "CIF", "Departamento", "Centro", "Estado Contrato"]
            const data = contratos.map((contrato) => [
                contrato.Empleado ? `${contrato.Empleado.apellidos}, ${contrato.Empleado.nombre}` : "N/A",
                contrato.Empleado?.dni_nie || "N/A",
                contrato.Empresa?.nombre || "N/A",
                contrato.Empresa?.cif || "N/A",
                contrato.Empleado?.Departamento?.nombre || "Sin asignar",
                contrato.Empleado?.Centro?.nombre || "Sin asignar",
                contrato.fecha_fin && new Date(contrato.fecha_fin) < new Date() ? "Finalizado" : "Vigente",
            ])

            currentY = PDFStyles.createTable(doc, headers, data, currentY)

            const empleadosUnicos = [...new Set(contratos.map((c) => c.Empleado?.dni_nie).filter(Boolean))]
            const empresasUnicas = [...new Set(contratos.map((c) => c.Empresa?.nombre).filter(Boolean))]

            const resumen = [
                { label: "Total contratos", value: contratos.length },
                { label: "Empleados únicos", value: empleadosUnicos.length },
                { label: "Empresas diferentes", value: empresasUnicas.length },
                {
                    label: "Contratos vigentes",
                    value: contratos.filter((c) => !c.fecha_fin || new Date(c.fecha_fin) >= new Date()).length,
                },
            ]

            PDFStyles.addSummary(doc, resumen, currentY)
            InformesPDFController.finalizePDF(doc)
        } catch (error) {
            InformesPDFController.handlePDFError(res, error, "Error generando informe general por empresas")
        }
    }

    static async empleadosPorEmpresaEspecifica(req, res) {
        try {
            const { id } = req.params

            const empresa = await Empresa.findByPk(id)
            if (!empresa) {
                return res.status(404).json({
                    success: false,
                    message: "Empresa no encontrada",
                })
            }

            const contratos = await Contrato.findAll({
                where: { id_empresa: id },
                include: [
                    {
                        model: Empleado,
                        attributes: ["nombre", "apellidos", "dni_nie", "puesto_actual", "activo"],
                        include: [
                            { model: Departamento, attributes: ["nombre"] },
                            { model: Centro, attributes: ["nombre"] },
                        ],
                    },
                    { model: Empresa, attributes: ["nombre", "cif"] },
                ],
                order: [
                    [Empleado, "apellidos", "ASC"],
                    [Empleado, "nombre", "ASC"],
                ],
            })

            const doc = new PDFDocument(PDFStyles.getBaseConfig())
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", `inline; filename="empleados_empresa_${id}.pdf"`)
            doc.pipe(res)

            let currentY = PDFStyles.addHeader(
                doc,
                `Empleados de la Empresa: ${empresa.nombre}`,
                `CIF: ${empresa.cif} | Total contratos: ${contratos.length}`,
            )

            const headers = ["Empleado", "DNI/NIE", "Departamento", "Centro", "Puesto", "Estado Empleado", "Estado Contrato"]
            const data = contratos.map((contrato) => [
                contrato.Empleado ? `${contrato.Empleado.apellidos}, ${contrato.Empleado.nombre}` : "N/A",
                contrato.Empleado?.dni_nie || "N/A",
                contrato.Empleado?.Departamento?.nombre || "Sin asignar",
                contrato.Empleado?.Centro?.nombre || "Sin asignar",
                contrato.Empleado?.puesto_actual || "Sin definir",
                contrato.Empleado?.activo ? "Activo" : "Inactivo",
                contrato.fecha_fin && new Date(contrato.fecha_fin) < new Date() ? "Finalizado" : "Vigente",
            ])

            currentY = PDFStyles.createTable(doc, headers, data, currentY)

            const empleadosUnicos = [...new Set(contratos.map((c) => c.Empleado?.dni_nie).filter(Boolean))]

            const resumen = [
                { label: "Empresa", value: empresa.nombre },
                { label: "CIF", value: empresa.cif },
                { label: "Dirección", value: empresa.direccion || "No especificada" },
                { label: "Total contratos", value: contratos.length },
                { label: "Empleados únicos", value: empleadosUnicos.length },
                {
                    label: "Contratos vigentes",
                    value: contratos.filter((c) => !c.fecha_fin || new Date(c.fecha_fin) >= new Date()).length,
                },
            ]

            PDFStyles.addSummary(doc, resumen, currentY)
            InformesPDFController.finalizePDF(doc)
        } catch (error) {
            InformesPDFController.handlePDFError(res, error, "Error generando informe específico por empresa")
        }
    }

    // ========================================
    // INFORME DE CUMPLEAÑOS OPTIMIZADO
    // ========================================

    static async cumpleanosPorRango(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query

            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({
                    success: false,
                    message: "Parámetros 'fechaInicio' y 'fechaFin' son requeridos",
                    formato: "YYYY-MM-DD",
                    ejemplo: "?fechaInicio=2024-01-01&fechaFin=2024-12-31",
                })
            }

            const fechaInicioObj = new Date(fechaInicio + "T00:00:00")
            const fechaFinObj = new Date(fechaFin + "T23:59:59")

            if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaFinObj.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Formato de fecha inválido",
                    formato_requerido: "YYYY-MM-DD",
                    fechas_recibidas: { fechaInicio, fechaFin },
                })
            }

            if (fechaInicioObj > fechaFinObj) {
                return res.status(400).json({
                    success: false,
                    message: "La fecha de inicio debe ser anterior o igual a la fecha de fin",
                    fechas_recibidas: { fechaInicio, fechaFin },
                })
            }

            const empleados = await Empleado.findAll({
                where: {
                    activo: true,
                    fecha_nacimiento: { [Op.not]: null },
                },
                include: [
                    { model: Departamento, attributes: ["nombre"] },
                    { model: Centro, attributes: ["nombre"] },
                ],
                order: [
                    ["apellidos", "ASC"],
                    ["nombre", "ASC"],
                ],
            })

            const empleadosCumpleanos = []

            empleados.forEach((emp) => {
                if (!emp.fecha_nacimiento) return

                const fechaNac = new Date(emp.fecha_nacimiento)

                const cumpleEsteAno = new Date(fechaInicioObj.getFullYear(), fechaNac.getMonth(), fechaNac.getDate())

                let cumpleProximoAno = null
                if (cumpleEsteAno < fechaInicioObj) {
                    cumpleProximoAno = new Date(fechaInicioObj.getFullYear() + 1, fechaNac.getMonth(), fechaNac.getDate())
                }

                const cumpleEnRango =
                    (cumpleEsteAno >= fechaInicioObj && cumpleEsteAno <= fechaFinObj) ||
                    (cumpleProximoAno && cumpleProximoAno >= fechaInicioObj && cumpleProximoAno <= fechaFinObj)

                if (cumpleEnRango) {
                    const fechaCumple = cumpleEsteAno >= fechaInicioObj ? cumpleEsteAno : cumpleProximoAno
                    const edad = fechaCumple.getFullYear() - fechaNac.getFullYear()

                    const hoy = new Date()
                    const diasHasta = Math.ceil((fechaCumple - hoy) / (1000 * 60 * 60 * 24))

                    empleadosCumpleanos.push({
                        ...emp.toJSON(),
                        proximoCumpleanos: fechaCumple,
                        edad: edad,
                        fechaNacimiento: fechaNac,
                        diasHastaCumple: diasHasta,
                    })
                }
            })

            empleadosCumpleanos.sort((a, b) => a.proximoCumpleanos - b.proximoCumpleanos)

            const doc = new PDFDocument(PDFStyles.getBaseConfig())
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", 'inline; filename="cumpleanos_rango_fechas.pdf"')
            doc.pipe(res)

            let currentY = PDFStyles.addHeader(
                doc,
                "Cumpleaños por Rango de Fechas",
                `Del ${PDFStyles.formatDate(fechaInicioObj)} al ${PDFStyles.formatDate(fechaFinObj)}`,
            )

            if (empleadosCumpleanos.length === 0) {
                currentY = PDFStyles.addNoDataMessage(
                    doc,
                    `No hay empleados que cumplan años entre el ${PDFStyles.formatDate(fechaInicioObj)} y el ${PDFStyles.formatDate(fechaFinObj)}`,
                    currentY + 20,
                )

                const resumen = [
                    {
                        label: "Rango consultado",
                        value: `${PDFStyles.formatDate(fechaInicioObj)} - ${PDFStyles.formatDate(fechaFinObj)}`,
                    },
                    { label: "Total empleados que cumplen años", value: 0 },
                    { label: "Empleados activos en sistema", value: empleados.length },
                    { label: "Días en el rango", value: Math.ceil((fechaFinObj - fechaInicioObj) / (1000 * 60 * 60 * 24)) + 1 },
                ]

                PDFStyles.addSummary(doc, resumen, currentY + 20)
            } else {
                // Si hay cumpleaños, mostrar tabla
                const headers = [
                    "Nombre Completo",
                    "Departamento",
                    "Centro",
                    "Fecha Cumpleaños",
                    "Edad que Cumple",
                    "Teléfono",
                    "Email",
                ]
                const data = empleadosCumpleanos.map((emp) => [
                    `${emp.apellidos}, ${emp.nombre}`,
                    emp.Departamento?.nombre || "Sin asignar",
                    emp.Centro?.nombre || "Sin asignar",
                    PDFStyles.formatDate(emp.proximoCumpleanos),
                    `${emp.edad} años`,
                    emp.telefono || "No registrado",
                    emp.email || "No registrado",
                ])

                currentY = PDFStyles.createTable(doc, headers, data, currentY)

                const resumen = [
                    {
                        label: "Rango consultado",
                        value: `${PDFStyles.formatDate(fechaInicioObj)} - ${PDFStyles.formatDate(fechaFinObj)}`,
                    },
                    { label: "Total empleados que cumplen años", value: empleadosCumpleanos.length },
                    {
                        label: "Edad promedio",
                        value: `${(empleadosCumpleanos.reduce((sum, e) => sum + e.edad, 0) / empleadosCumpleanos.length).toFixed(1)} años`,
                    },
                    { label: "Con teléfono registrado", value: empleadosCumpleanos.filter((e) => e.telefono).length },
                    { label: "Con email registrado", value: empleadosCumpleanos.filter((e) => e.email).length },
                ]

                PDFStyles.addSummary(doc, resumen, currentY)
            }

            InformesPDFController.finalizePDF(doc)
        } catch (error) {
            InformesPDFController.handlePDFError(res, error, "Error generando informe de cumpleaños por rango")
        }
    }

    // ========================================
    // OTROS INFORMES
    // ========================================

    static async dashboardEjecutivo(req, res) {
        try {
            const totalEmpleados = await Empleado.count()
            const empleadosActivos = await Empleado.count({ where: { activo: true } })
            const empleadosInactivos = totalEmpleados - empleadosActivos

            const departamentos = await Departamento.findAll({
                attributes: ["id_departamento", "nombre"],
                include: [{ model: Empleado, attributes: ["id_empleado", "activo"] }],
            })

            const centros = await Centro.findAll({
                attributes: ["id_centro", "nombre"],
                include: [{ model: Empleado, attributes: ["id_empleado", "activo"] }],
            })

            const doc = new PDFDocument(PDFStyles.getBaseConfig())
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", 'inline; filename="dashboard_ejecutivo.pdf"')
            doc.pipe(res)

            let currentY = PDFStyles.addHeader(doc, "Dashboard Ejecutivo", "Resumen ejecutivo de recursos humanos")

            const metricas = [
                ["Total Empleados", totalEmpleados.toString(), "100%"],
                [
                    "Empleados Activos",
                    empleadosActivos.toString(),
                    `${((empleadosActivos / totalEmpleados) * 100).toFixed(1)}%`,
                ],
                [
                    "Empleados Inactivos",
                    empleadosInactivos.toString(),
                    `${((empleadosInactivos / totalEmpleados) * 100).toFixed(1)}%`,
                ],
            ]

            const headers = ["Métrica", "Valor", "Porcentaje"]
            currentY = PDFStyles.createTable(doc, headers, metricas, currentY)

            currentY += 25
            const colors = PDFStyles.getColors()
            const fonts = PDFStyles.getFonts()

            doc
                .fillColor(colors.primary)
                .fontSize(fonts.sectionTitle.size)
                .font(fonts.sectionTitle.font)
                .text("Distribución por Departamentos", 40, currentY)
            currentY += 25

            const depHeaders = ["Departamento", "Total Empleados", "Activos", "Inactivos"]
            const depData = departamentos.map((dep) => {
                const total = dep.Empleados?.length || 0
                const activos = dep.Empleados?.filter((e) => e.activo).length || 0
                return [dep.nombre, total.toString(), activos.toString(), (total - activos).toString()]
            })

            currentY = PDFStyles.createTable(doc, depHeaders, depData, currentY)

            currentY += 25
            doc
                .fillColor(colors.primary)
                .fontSize(fonts.sectionTitle.size)
                .font(fonts.sectionTitle.font)
                .text("Distribución por Centros", 40, currentY)
            currentY += 25

            const centroHeaders = ["Centro", "Total Empleados", "Activos", "Inactivos"]
            const centroData = centros.map((centro) => {
                const total = centro.Empleados?.length || 0
                const activos = centro.Empleados?.filter((e) => e.activo).length || 0
                return [centro.nombre, total.toString(), activos.toString(), (total - activos).toString()]
            })

            currentY = PDFStyles.createTable(doc, centroHeaders, centroData, currentY)

            const resumen = [
                { label: "Total empleados", value: totalEmpleados },
                { label: "Tasa de actividad", value: `${((empleadosActivos / totalEmpleados) * 100).toFixed(1)}%` },
                { label: "Total departamentos", value: departamentos.length },
                { label: "Total centros", value: centros.length },
            ]

            PDFStyles.addSummary(doc, resumen, currentY)
            InformesPDFController.finalizePDF(doc)
        } catch (error) {
            InformesPDFController.handlePDFError(res, error, "Error generando dashboard ejecutivo")
        }
    }

    static async informeContactos(req, res) {
        try {
            const empleados = await Empleado.findAll({
                where: { activo: true },
                include: [
                    { model: Departamento, attributes: ["nombre"] },
                    { model: Centro, attributes: ["nombre"] },
                ],
                order: [
                    ["apellidos", "ASC"],
                    ["nombre", "ASC"],
                ],
            })

            const doc = new PDFDocument(PDFStyles.getBaseConfig())
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", 'inline; filename="informe_contactos.pdf"')
            doc.pipe(res)

            let currentY = PDFStyles.addHeader(doc, "Directorio de Contactos", "Información de contacto de empleados activos")

            const headers = ["Nombre Completo", "Departamento", "Centro", "Teléfono", "Email", "Dirección"]
            const data = empleados.map((emp) => [
                `${emp.apellidos}, ${emp.nombre}`,
                emp.Departamento?.nombre || "Sin asignar",
                emp.Centro?.nombre || "Sin asignar",
                emp.telefono || "N/A",
                emp.email || "N/A",
                emp.direccion || "N/A",
            ])

            currentY = PDFStyles.createTable(doc, headers, data, currentY)

            const resumen = [
                { label: "Total empleados activos", value: empleados.length },
                { label: "Con teléfono registrado", value: empleados.filter((e) => e.telefono).length },
                { label: "Con email registrado", value: empleados.filter((e) => e.email).length },
                { label: "Con dirección registrada", value: empleados.filter((e) => e.direccion).length },
            ]

            PDFStyles.addSummary(doc, resumen, currentY)
            InformesPDFController.finalizePDF(doc)
        } catch (error) {
            InformesPDFController.handlePDFError(res, error, "Error generando informe de contactos")
        }
    }

}

module.exports = InformesPDFController
