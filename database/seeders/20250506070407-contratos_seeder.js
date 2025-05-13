'use strict';
const { faker } = require('@faker-js/faker/locale/es');
const fs = require('fs');
const path = require('path');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ No se crearán datos de ejemplo en entorno de producción');
      return;
    }

    const empleados = await queryInterface.sequelize.query(
        'SELECT id_empleado FROM empleados',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (empleados.length === 0) {
      console.log('⚠️ No hay empleados para crear contratos');
      return;
    }

    const tiposContrato = await queryInterface.sequelize.query(
        'SELECT id_tipo_contrato FROM tipos_contrato',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (tiposContrato.length === 0) {
      console.log('⚠️ No hay tipos de contrato disponibles');
      return;
    }

    const empresas = await queryInterface.sequelize.query(
        'SELECT id_empresa FROM empresas',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (empresas.length === 0) {
      console.log('⚠️ No hay empresas disponibles');
      return;
    }

    const convenios = await queryInterface.sequelize.query(
        'SELECT id_convenio FROM convenios',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const categoriasPorConvenio = {};
    if (convenios.length > 0) {
      for (const convenio of convenios) {
        const categorias = await queryInterface.sequelize.query(
            'SELECT id_categoria FROM categorias_convenio WHERE id_convenio = ?',
            {
              replacements: [convenio.id_convenio],
              type: queryInterface.sequelize.QueryTypes.SELECT
            }
        );

        if (categorias.length > 0) {
          categoriasPorConvenio[convenio.id_convenio] = categorias;
        }
      }
    }

    const uploadPath = process.env.NODE_ENV === 'production'
        ? process.env.PROD_UPLOAD_PATH || './uploads/contratos'
        : process.env.DEV_UPLOAD_PATH || './uploads/contratos';

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`✅ Creado directorio para archivos: ${uploadPath}`);
    }

    const contratos = [];
    const contratosConArchivo = Math.min(10, empleados.length);

    for (let i = 0; i < empleados.length; i++) {
      const empleado = empleados[i];

      const tieneArchivo = i < contratosConArchivo;

      const tipoContrato = tiposContrato[Math.floor(Math.random() * tiposContrato.length)];

      const empresa = empresas[Math.floor(Math.random() * empresas.length)];

      const fechaInicio = faker.date.between({
        from: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000),
        to: new Date()
      });

      const esIndefinido = Math.random() > 0.5;

      let fechaFin = null;
      if (!esIndefinido) {
        fechaFin = new Date(fechaInicio);
        fechaFin.setMonth(fechaFin.getMonth() + faker.number.int({ min: 6, max: 36 }));

        if (fechaFin > new Date() && Math.random() > 0.5) {
          fechaFin = null;
        }
      }

      const finPeriodoPrueba = new Date(fechaInicio);
      finPeriodoPrueba.setDate(finPeriodoPrueba.getDate() + faker.number.int({ min: 15, max: 180 }));

      const hoy = new Date();
      const antiguedadDias = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24));

      let idConvenio = null;
      let idCategoria = null;

      if (convenios.length > 0 && Math.random() > 0.3) {
        const convenio = convenios[Math.floor(Math.random() * convenios.length)];
        idConvenio = convenio.id_convenio;

        if (categoriasPorConvenio[idConvenio] && categoriasPorConvenio[idConvenio].length > 0) {
          const categorias = categoriasPorConvenio[idConvenio];
          const categoria = categorias[Math.floor(Math.random() * categorias.length)];
          idCategoria = categoria.id_categoria;
        }
      }

      let rutaArchivo = null;
      let nombreOriginal = null;
      let mimetype = null;
      let tamano = null;

      if (tieneArchivo) {
        const timestamp = Date.now();
        const nombreArchivo = `contrato_${empleado.id_empleado}_${timestamp}.pdf`;
        rutaArchivo = `${uploadPath}/${nombreArchivo}`;
        nombreOriginal = `Contrato_${faker.person.lastName()}_${faker.date.recent().toISOString().split('T')[0]}.pdf`;
        mimetype = 'application/pdf';
        tamano = faker.number.int({ min: 50000, max: 2000000 });

        fs.writeFileSync(rutaArchivo, 'Contenido simulado del contrato');
        console.log(`✅ Creado archivo de contrato simulado: ${rutaArchivo}`);
      }

      contratos.push({
        id_empleado: empleado.id_empleado,
        id_tipo_contrato: tipoContrato.id_tipo_contrato,
        id_empresa: empresa.id_empresa,
        id_convenio: idConvenio,
        id_categoria: idCategoria,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        fin_periodo_prueba: finPeriodoPrueba,
        antiguedad_contrato: antiguedadDias,
        fecha_creacion: new Date(),
        ruta_archivo: rutaArchivo,
        nombre_original: nombreOriginal,
        mimetype: mimetype,
        tamano: tamano
      });
    }

    await queryInterface.bulkInsert('contratos', contratos, {});
    console.log(`✅ Creados ${contratos.length} contratos de ejemplo`);
  },

  async down(queryInterface, Sequelize) {
    const contratos = await queryInterface.sequelize.query(
        'SELECT ruta_archivo FROM contratos WHERE ruta_archivo IS NOT NULL',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const contrato of contratos) {
      if (contrato.ruta_archivo && fs.existsSync(contrato.ruta_archivo)) {
        fs.unlinkSync(contrato.ruta_archivo);
      }
    }

    await queryInterface.bulkDelete('contratos', null, {});
  }
};