'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    const tiposContrato = [
      {
        nombre: 'Indefinido ordinario',
        codigo: '100',
        descripcion: 'Contrato indefinido a tiempo completo'
      },
      {
        nombre: 'Indefinido de apoyo a emprendedores',
        codigo: '150',
        descripcion: 'Contrato indefinido de apoyo a emprendedores'
      },
      {
        nombre: 'Indefinido a tiempo parcial',
        codigo: '200',
        descripcion: 'Contrato indefinido a tiempo parcial'
      },
      {
        nombre: 'Temporal por obra o servicio',
        codigo: '401',
        descripcion: 'Contrato temporal por obra o servicio determinado'
      },
      {
        nombre: 'Temporal por circunstancias de la producción',
        codigo: '402',
        descripcion: 'Contrato temporal por circunstancias de la producción'
      },
      {
        nombre: 'Temporal de interinidad',
        codigo: '410',
        descripcion: 'Contrato temporal de interinidad'
      },
      {
        nombre: 'Contrato en prácticas',
        codigo: '420',
        descripcion: 'Contrato temporal en prácticas'
      },
      {
        nombre: 'Contrato para la formación y el aprendizaje',
        codigo: '421',
        descripcion: 'Contrato para la formación y el aprendizaje'
      },
      {
        nombre: 'Contrato de relevo',
        codigo: '441',
        descripcion: 'Contrato de relevo'
      },
      {
        nombre: 'Contrato fijo-discontinuo',
        codigo: '300',
        descripcion: 'Contrato por tiempo indefinido fijo-discontinuo'
      }
    ];

    await queryInterface.bulkInsert('tipos_contrato', tiposContrato, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tipos_contrato', null, {});
  }
};