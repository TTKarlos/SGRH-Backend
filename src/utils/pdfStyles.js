/**
 * utils/pdfStyles.js
 * Utilidades de estilo para PDFs del sistema RRHH
 */

class PDFStyles {
    /**
     * Configuración base para todos los PDFs
     */
    static getBaseConfig() {
        return {
            size: "A4",
            margins: { top: 60, bottom: 60, left: 40, right: 40 },
            bufferPages: true,
            info: {
                Title: "Informe SGRH",
                Author: "Sistema de Gestión de RRHH",
                Subject: "Informe generado automáticamente",
                Creator: "SGRH La Sirena",
            },
        }
    }

    /**
     * Colores corporativos
     */
    static getColors() {
        return {
            primary: "#DC2626", // Rojo corporativo
            secondary: "#666666", // Gris oscuro
            text: "#374151", // Gris texto
            background: "#F9FAFB", // Gris claro
            white: "#FFFFFF",
            border: "#E5E7EB",
            lightBackground: "#FEF2F2",
        }
    }

    /**
     * Configuración de fuentes
     */
    static getFonts() {
        return {
            title: { font: "Helvetica-Bold", size: 24 },
            subtitle: { font: "Helvetica-Bold", size: 18 },
            sectionTitle: { font: "Helvetica-Bold", size: 14 },
            header: { font: "Helvetica-Bold", size: 9 },
            body: { font: "Helvetica", size: 8 },
            small: { font: "Helvetica", size: 8 },
            caption: { font: "Helvetica", size: 10 },
        }
    }

    /**
     * Calcula la altura necesaria para una fila basada en el contenido
     */
    static calculateRowHeight(rowData, columnWidths, headers) {
        const fonts = this.getFonts()
        const minHeight = 35
        let maxHeight = minHeight

        rowData.forEach((cellData, index) => {
            const cellText = String(cellData || "")
            const cellWidth = columnWidths[index]
            const header = headers[index]

            if (header === "Centro" || header === "Puesto" || header === "Último Puesto" || header === "Email") {
                const avgCharWidth = fonts.body.size * 0.6
                const availableWidth = cellWidth - 8
                const charsPerLine = Math.floor(availableWidth / avgCharWidth)

                if (charsPerLine > 0) {
                    const words = cellText.split(" ")
                    let lines = 1
                    let currentLineLength = 0

                    words.forEach((word) => {
                        if (currentLineLength + word.length + 1 > charsPerLine && currentLineLength > 0) {
                            lines++
                            currentLineLength = word.length
                        } else {
                            currentLineLength += word.length + (currentLineLength > 0 ? 1 : 0)
                        }
                    })

                    const requiredHeight = Math.max(minHeight, lines * 12 + 16)
                    maxHeight = Math.max(maxHeight, requiredHeight)
                }
            }
        })

        return maxHeight
    }

    /**
     * Calcula anchos de columna optimizados y balanceados
     */
    static calculateColumnWidths(headers, data, totalWidth) {
        const headerWidths = {
            "Nombre Completo": 120,
            Empleado: 120,
            "DNI/NIE": 70,
            Email: 150,
            Teléfono: 75,
            Departamento: 100,
            Centro: 120,
            Zona: 80,
            Puesto: 130,
            "Último Puesto": 130,
            Estado: 60,
            "Estado Empleado": 80,
            "Estado Contrato": 85,
            Fecha: 75,
            "Fecha Cumpleaños": 85,
            "Fecha Baja": 75,
            Edad: 50,
            "Edad que Cumple": 75,
            Dirección: 120,
            Empresa: 100,
            CIF: 70,
            Motivo: 100,
        }

        const calculatedWidths = headers.map((header) => {
            return headerWidths[header] || 80
        })

        const totalCalculated = calculatedWidths.reduce((sum, width) => sum + width, 0)

        if (totalCalculated > totalWidth) {
            const factor = totalWidth / totalCalculated
            return calculatedWidths.map((width) => Math.floor(width * factor))
        }

        const extraSpace = totalWidth - totalCalculated
        if (extraSpace > 0) {
            const extraPerColumn = Math.floor(extraSpace / headers.length)
            return calculatedWidths.map((width) => width + extraPerColumn)
        }

        return calculatedWidths
    }

    /**
     * Añade el encabezado corporativo al PDF
     */
    static addHeader(doc, titulo, subtitulo = null) {
        const pageWidth = doc.page.width
        const margin = 40
        const colors = this.getColors()
        const fonts = this.getFonts()

        doc.rect(0, 0, pageWidth, 90).fill(colors.primary)

        doc.fillColor(colors.white).fontSize(fonts.title.size).font(fonts.title.font).text("SGRH La Sirena", margin, 25)

        doc
            .moveTo(margin, 70)
            .lineTo(pageWidth - margin, 70)
            .strokeColor(colors.white)
            .lineWidth(2)
            .stroke()

        const fecha = new Date().toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })

        doc
            .fillColor(colors.white)
            .fontSize(fonts.small.size)
            .font("Helvetica")
            .text(`Generado: ${fecha}`, pageWidth - 180, 25)

        doc.fillColor(colors.primary).fontSize(fonts.subtitle.size).font(fonts.subtitle.font).text(titulo, margin, 110)

        let currentY = 140
        if (subtitulo) {
            doc.fillColor(colors.secondary).fontSize(fonts.caption.size).font("Helvetica").text(subtitulo, margin, 135)
            currentY = 160
        }

        return currentY
    }

    /**
     * Añade pie de página
     */
    static addFooter(doc) {
        const colors = this.getColors()
        const fonts = this.getFonts()
        const margin = 40

        const totalPages = doc.bufferedPageRange().count

        for (let i = 0; i < totalPages; i++) {
            doc.switchToPage(i)

            const pageHeight = doc.page.height
            const pageWidth = doc.page.width

            doc
                .moveTo(margin, pageHeight - 90)
                .lineTo(pageWidth - margin, pageHeight - 90)
                .strokeColor(colors.primary)
                .lineWidth(1)
                .stroke()

            doc
                .fillColor(colors.secondary)
                .fontSize(fonts.small.size)
                .text("Sistema de Gestión de Recursos Humanos - La Sirena", margin, pageHeight - 75)
                .text(`Página ${i + 1} de ${totalPages}`, pageWidth - 120, pageHeight - 75)
        }
    }

    /**
     * Crea una tabla completamente rediseñada y optimizada
     */
    static createTable(doc, headers, data, startY, options = {}) {
        const margin = 40
        const pageWidth = doc.page.width - margin * 2
        const minRowHeight = options.rowHeight || 35
        const headerHeight = options.headerHeight || 35
        const colors = this.getColors()
        const fonts = this.getFonts()

        let currentY = startY

        const columnWidths = this.calculateColumnWidths(headers, data, pageWidth)

        const addHeaders = (y) => {
            doc.rect(margin, y, pageWidth, headerHeight).fill(colors.primary)

            doc.rect(margin, y, pageWidth, headerHeight).strokeColor(colors.white).lineWidth(1).stroke()

            let xPos = margin
            for (let i = 0; i < columnWidths.length; i++) {
                if (i > 0) {
                    doc
                        .moveTo(xPos, y)
                        .lineTo(xPos, y + headerHeight)
                        .strokeColor(colors.white)
                        .lineWidth(1)
                        .stroke()
                }
                xPos += columnWidths[i]
            }

            doc.fillColor(colors.white).fontSize(fonts.header.size).font(fonts.header.font)

            let currentX = margin
            headers.forEach((header, index) => {
                const cellWidth = columnWidths[index]

                const textWidth = doc.widthOfString(header)
                const textX = currentX + (cellWidth - textWidth) / 2
                const textY = y + (headerHeight - fonts.header.size) / 2 + 2

                doc.text(header, textX, textY, {
                    lineBreak: false,
                    width: cellWidth - 4,
                    ellipsis: false,
                })

                currentX += cellWidth
            })

            return y + headerHeight
        }

        const addDataRow = (rowData, y, isEven = false) => {
            const rowHeight = this.calculateRowHeight(rowData, columnWidths, headers)


            const bgColor = isEven ? colors.background : colors.white
            doc.rect(margin, y, pageWidth, rowHeight).fill(bgColor)

            doc.rect(margin, y, pageWidth, rowHeight).strokeColor(colors.border).lineWidth(0.5).stroke()

            let xPos = margin
            for (let i = 0; i < columnWidths.length; i++) {
                if (i > 0) {
                    doc
                        .moveTo(xPos, y)
                        .lineTo(xPos, y + rowHeight)
                        .strokeColor(colors.border)
                        .lineWidth(0.5)
                        .stroke()
                }
                xPos += columnWidths[i]
            }

            doc.fillColor(colors.text).fontSize(fonts.body.size).font(fonts.body.font)

            let currentX = margin
            rowData.forEach((cellData, index) => {
                const cellWidth = columnWidths[index]
                const cellText = String(cellData || "")
                const header = headers[index]
                const padding = 4
                const textX = currentX + padding
                const textY = y + padding + 2
                const availableWidth = cellWidth - padding * 2

                let displayText = cellText
                let useLineBreaks = false

                if (header === "Centro" || header === "Puesto" || header === "Último Puesto" || header === "Email") {
                    displayText = cellText
                    useLineBreaks = true
                }
                else if (index === 0 && cellText.length > 20) {
                    const parts = cellText.split(", ")
                    if (parts.length === 2) {
                        const apellidos = parts[0].split(" ").slice(0, 2).join(" ")
                        const nombre = parts[1].split(" ")[0]
                        displayText = `${apellidos}, ${nombre}`
                    }
                }
                else if (cellText.includes("@") && cellText.length > 18) {
                    const parts = cellText.split("@")
                    if (parts[0].length > 12) {
                        displayText = `${parts[0].substring(0, 10)}...@${parts[1]}`
                    }
                }
                else if (
                    cellText.length > 15 &&
                    header !== "Centro" &&
                    header !== "Puesto" &&
                    header !== "Último Puesto" &&
                    header !== "Email"
                ) {
                    displayText = cellText.substring(0, 12) + "..."
                }

                doc.text(displayText, textX, textY, {
                    width: availableWidth,
                    height: rowHeight - padding * 2,
                    align: "left",
                    lineBreak: useLineBreaks,
                    ellipsis: false,
                })

                currentX += cellWidth
            })

            return y + rowHeight
        }

        currentY = addHeaders(currentY)

        data.forEach((row, index) => {
            const nextRowHeight = this.calculateRowHeight(row, columnWidths, headers)

            if (currentY + nextRowHeight > doc.page.height - 120) {
                doc.addPage()
                this.addHeader(doc, "Continuación del Informe")
                currentY = 170
                currentY = addHeaders(currentY)
            }

            currentY = addDataRow(row, currentY, index % 2 === 0)
        })

        return currentY + 20
    }

    /**
     * Añade sección de resumen
     */
    static addSummary(doc, summaryData, startY) {
        const margin = 40
        const pageWidth = doc.page.width - margin * 2
        const colors = this.getColors()
        const fonts = this.getFonts()

        if (startY + (summaryData.length * 25 + 80) > doc.page.height - 120) {
            doc.addPage()
            this.addHeader(doc, "Resumen del Informe")
            startY = 170
        }

        doc
            .fillColor(colors.primary)
            .fontSize(fonts.sectionTitle.size)
            .font(fonts.sectionTitle.font)
            .text("Resumen", margin, startY)

        let currentY = startY + 35

        doc
            .rect(margin, currentY, pageWidth, summaryData.length * 25 + 20)
            .fill(colors.lightBackground)
            .strokeColor(colors.primary)
            .lineWidth(1)
            .stroke()

        currentY += 15

        doc
            .fillColor(colors.text)
            .fontSize(fonts.body.size + 1)
            .font("Helvetica")

        summaryData.forEach((item) => {
            doc.text(`${item.label}: ${item.value}`, margin + 15, currentY)
            currentY += 25
        })

        return currentY + 25
    }

    /**
     * Crea un mensaje de "sin datos" centrado
     */
    static addNoDataMessage(doc, message, startY) {
        const pageWidth = doc.page.width
        const colors = this.getColors()
        const fonts = this.getFonts()

        doc
            .rect(40, startY, pageWidth - 80, 100)
            .fill(colors.lightBackground)
            .strokeColor(colors.primary)
            .lineWidth(2)
            .stroke()

        doc
            .fillColor(colors.primary)
            .fontSize(36)
            .font("Helvetica-Bold")
            .text("📅", pageWidth / 2 - 20, startY + 20)

        doc
            .fillColor(colors.text)
            .fontSize(fonts.sectionTitle.size)
            .font(fonts.sectionTitle.font)
            .text(message, 60, startY + 65, {
                width: pageWidth - 120,
                align: "center",
            })

        return startY + 120
    }

    /**
     * Formatea una fecha
     */
    static formatDate(date) {
        if (!date) return "N/A"
        return new Date(date).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
    }

    /**
     * Verifica si hay suficiente espacio en la página actual
     */
    static hasSpaceForContent(doc, requiredHeight) {
        const currentY = doc.y || 0
        const pageHeight = doc.page.height
        const bottomMargin = 120

        return currentY + requiredHeight < pageHeight - bottomMargin
    }
}

module.exports = PDFStyles
