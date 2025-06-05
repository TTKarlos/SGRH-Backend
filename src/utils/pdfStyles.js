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
            bufferPages: true, // Importante para numerar páginas correctamente
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

            // Para Centro, Puesto y Email, calcular altura necesaria para texto completo
            if (header === "Centro" || header === "Puesto" || header === "Último Puesto" || header === "Email") {
                const avgCharWidth = fonts.body.size * 0.6
                const availableWidth = cellWidth - 8 // padding
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
        // Definir anchos específicos para cada tipo de header
        const headerWidths = {
            "Nombre Completo": 120,
            Empleado: 120,
            "DNI/NIE": 70,
            Email: 150, // Aumentado de 130 a 150 para permitir más texto
            Teléfono: 75,
            Departamento: 100,
            Centro: 120, // Aumentado para permitir más texto
            Zona: 80,
            Puesto: 130, // Aumentado para permitir más texto
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

        // Asignar anchos específicos a cada header
        const calculatedWidths = headers.map((header) => {
            return headerWidths[header] || 80 // Ancho por defecto si no está definido
        })

        // Calcular el total
        const totalCalculated = calculatedWidths.reduce((sum, width) => sum + width, 0)

        // Ajustar si excede el ancho disponible
        if (totalCalculated > totalWidth) {
            const factor = totalWidth / totalCalculated
            return calculatedWidths.map((width) => Math.floor(width * factor))
        }

        // Si hay espacio extra, distribuirlo proporcionalmente
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

        // Fondo rojo para el header
        doc.rect(0, 0, pageWidth, 90).fill(colors.primary)

        // Logo/Título principal
        doc.fillColor(colors.white).fontSize(fonts.title.size).font(fonts.title.font).text("SGRH La Sirena", margin, 25)

        // Línea separadora blanca
        doc
            .moveTo(margin, 70)
            .lineTo(pageWidth - margin, 70)
            .strokeColor(colors.white)
            .lineWidth(2)
            .stroke()

        // Fecha de generación en el header (lado derecho)
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

        // Título del informe
        doc.fillColor(colors.primary).fontSize(fonts.subtitle.size).font(fonts.subtitle.font).text(titulo, margin, 110)

        // Subtítulo si existe
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

        // Guardar el número total de páginas
        const totalPages = doc.bufferedPageRange().count

        // Iterar por cada página para añadir el pie de página
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
        const minRowHeight = options.rowHeight || 35 // Altura mínima de fila
        const headerHeight = options.headerHeight || 35 // Altura de header
        const colors = this.getColors()
        const fonts = this.getFonts()

        let currentY = startY

        // Calcular anchos de columna
        const columnWidths = this.calculateColumnWidths(headers, data, pageWidth)

        // Función para añadir encabezados
        const addHeaders = (y) => {
            // Fondo del header
            doc.rect(margin, y, pageWidth, headerHeight).fill(colors.primary)

            // Bordes del header
            doc.rect(margin, y, pageWidth, headerHeight).strokeColor(colors.white).lineWidth(1).stroke()

            // Líneas verticales del header
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

            // Texto de los headers - CENTRADO Y EN UNA SOLA LÍNEA
            doc.fillColor(colors.white).fontSize(fonts.header.size).font(fonts.header.font)

            let currentX = margin
            headers.forEach((header, index) => {
                const cellWidth = columnWidths[index]

                // Calcular posición centrada
                const textWidth = doc.widthOfString(header)
                const textX = currentX + (cellWidth - textWidth) / 2
                const textY = y + (headerHeight - fonts.header.size) / 2 + 2

                // Renderizar el header SIN saltos de línea
                doc.text(header, textX, textY, {
                    lineBreak: false,
                    width: cellWidth - 4,
                    ellipsis: false,
                })

                currentX += cellWidth
            })

            return y + headerHeight
        }

        // Función para añadir una fila de datos
        const addDataRow = (rowData, y, isEven = false) => {
            // Calcular altura necesaria para esta fila
            const rowHeight = this.calculateRowHeight(rowData, columnWidths, headers)

            // Fondo alternado
            const bgColor = isEven ? colors.background : colors.white
            doc.rect(margin, y, pageWidth, rowHeight).fill(bgColor)

            // Borde de la fila
            doc.rect(margin, y, pageWidth, rowHeight).strokeColor(colors.border).lineWidth(0.5).stroke()

            // Líneas verticales
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

            // Contenido de las celdas
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

                // Formatear texto según el tipo de columna
                let displayText = cellText
                let useLineBreaks = false

                // Para Centro, Puesto y Email: mostrar texto completo con saltos de línea
                if (header === "Centro" || header === "Puesto" || header === "Último Puesto" || header === "Email") {
                    displayText = cellText
                    useLineBreaks = true
                }
                // Para nombres largos (primera columna generalmente)
                else if (index === 0 && cellText.length > 20) {
                    const parts = cellText.split(", ")
                    if (parts.length === 2) {
                        const apellidos = parts[0].split(" ").slice(0, 2).join(" ")
                        const nombre = parts[1].split(" ")[0]
                        displayText = `${apellidos}, ${nombre}`
                    }
                }
                // Para emails largos
                else if (cellText.includes("@") && cellText.length > 18) {
                    const parts = cellText.split("@")
                    if (parts[0].length > 12) {
                        displayText = `${parts[0].substring(0, 10)}...@${parts[1]}`
                    }
                }
                // Para otros textos largos (excepto Centro, Puesto y Email)
                else if (
                    cellText.length > 15 &&
                    header !== "Centro" &&
                    header !== "Puesto" &&
                    header !== "Último Puesto" &&
                    header !== "Email"
                ) {
                    displayText = cellText.substring(0, 12) + "..."
                }

                // Renderizar el texto
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

        // Añadir headers
        currentY = addHeaders(currentY)

        // Añadir filas de datos
        data.forEach((row, index) => {
            // Calcular altura necesaria para la próxima fila
            const nextRowHeight = this.calculateRowHeight(row, columnWidths, headers)

            // Verificar si necesitamos nueva página
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

        // Verificar si necesitamos nueva página para el resumen
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

        // Fondo para el mensaje
        doc
            .rect(40, startY, pageWidth - 80, 100)
            .fill(colors.lightBackground)
            .strokeColor(colors.primary)
            .lineWidth(2)
            .stroke()

        // Icono o símbolo
        doc
            .fillColor(colors.primary)
            .fontSize(36)
            .font("Helvetica-Bold")
            .text("📅", pageWidth / 2 - 20, startY + 20)

        // Mensaje principal
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
