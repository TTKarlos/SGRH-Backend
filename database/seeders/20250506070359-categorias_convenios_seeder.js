'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ No se crearán datos de ejemplo en entorno de producción');
      return;
    }

    const convenios = await queryInterface.sequelize.query(
        'SELECT id_convenio, nombre FROM convenios',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (convenios.length === 0) {
      console.log('⚠️ No hay convenios para crear categorías');
      return;
    }

    const categoriasPorConvenio = {
      'Oficinas y Despachos': [
        'Grupo I - Titulados',
        'Grupo II - Jefes Superiores',
        'Grupo III - Jefes de Primera',
        'Grupo IV - Jefes de Segunda',
        'Grupo V - Oficiales de Primera',
        'Grupo VI - Oficiales de Segunda',
        'Grupo VII - Auxiliares Administrativos',
        'Grupo VIII - Personal Subalterno'
      ],
      'Construcción': [
        'Grupo 1 - Titulados Superiores',
        'Grupo 2 - Titulados Medios',
        'Grupo 3 - Jefes Administrativos',
        'Grupo 4 - Encargados Generales',
        'Grupo 5 - Encargados de Obra',
        'Grupo 6 - Oficiales Administrativos',
        'Grupo 7 - Oficiales de Primera',
        'Grupo 8 - Oficiales de Segunda',
        'Grupo 9 - Peones Especializados',
        'Grupo 10 - Peones Ordinarios'
      ],
      'Hostelería': [
        'Grupo I - Jefes de Recepción',
        'Grupo II - Recepcionistas',
        'Grupo III - Jefes de Cocina',
        'Grupo IV - Cocineros',
        'Grupo V - Jefes de Sala',
        'Grupo VI - Camareros',
        'Grupo VII - Personal Auxiliar',
        'Grupo VIII - Personal de Limpieza'
      ],
      'Comercio': [
        'Grupo I - Directores',
        'Grupo II - Jefes de Área',
        'Grupo III - Jefes de Sección',
        'Grupo IV - Vendedores',
        'Grupo V - Auxiliares de Venta',
        'Grupo VI - Personal Administrativo',
        'Grupo VII - Personal de Almacén',
        'Grupo VIII - Personal de Servicios'
      ],
      'Metal': [
        'Grupo 1 - Ingenieros y Licenciados',
        'Grupo 2 - Peritos y Ayudantes',
        'Grupo 3 - Jefes de Taller',
        'Grupo 4 - Maestros de Taller',
        'Grupo 5 - Encargados',
        'Grupo 6 - Oficiales de Primera',
        'Grupo 7 - Oficiales de Segunda',
        'Grupo 8 - Oficiales de Tercera',
        'Grupo 9 - Especialistas',
        'Grupo 10 - Peones'
      ]
    };

    const categoriasGenericas = [
      'Grupo I - Nivel 1',
      'Grupo I - Nivel 2',
      'Grupo II - Nivel 1',
      'Grupo II - Nivel 2',
      'Grupo III - Nivel 1',
      'Grupo III - Nivel 2',
      'Grupo IV - Nivel 1',
      'Grupo IV - Nivel 2',
      'Grupo V - Nivel 1',
      'Grupo V - Nivel 2'
    ];

    let categorias = [];
    let contador = 0;

    for (const convenio of convenios) {
      let categoriasAUsar = categoriasGenericas;

      for (const tipoConvenio in categoriasPorConvenio) {
        if (convenio.nombre.includes(tipoConvenio)) {
          categoriasAUsar = categoriasPorConvenio[tipoConvenio];
          break;
        }
      }

      for (const nombreCategoria of categoriasAUsar) {
        categorias.push({
          id_convenio: convenio.id_convenio,
          nombre: nombreCategoria,
          descripcion: `Categoría profesional: ${nombreCategoria} del convenio ${convenio.nombre}`
        });
        contador++;
      }
    }

    await queryInterface.bulkInsert('categorias_convenio', categorias, {});
    console.log(`✅ Creadas ${contador} categorías de convenio de ejemplo`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categorias_convenio', null, {});
  }
};