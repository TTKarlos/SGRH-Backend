'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    const convenios = [
      {
        nombre: 'Convenio Colectivo de Oficinas y Despachos',
        codigo: '99000805011994',
        descripcion: 'Convenio colectivo nacional para el sector de oficinas y despachos'
      },
      {
        nombre: 'Convenio Colectivo de la Construcción',
        codigo: '99005585011900',
        descripcion: 'Convenio general del sector de la construcción'
      },
      {
        nombre: 'Convenio Colectivo de Hostelería',
        codigo: '99010365011900',
        descripcion: 'Acuerdo laboral de ámbito estatal para el sector de hostelería'
      },
      {
        nombre: 'Convenio Colectivo de Comercio',
        codigo: '99001925011981',
        descripcion: 'Convenio colectivo sectorial de comercio'
      },
      {
        nombre: 'Convenio Colectivo de Metal',
        codigo: '99003435011900',
        descripcion: 'Convenio colectivo estatal de la industria, la tecnología y los servicios del sector del metal'
      },
      {
        nombre: 'Convenio Colectivo de Transporte de Mercancías por Carretera',
        codigo: '99012735011994',
        descripcion: 'Convenio colectivo del sector de transporte de mercancías por carretera'
      },
      {
        nombre: 'Convenio Colectivo de Enseñanza Privada',
        codigo: '99000925011986',
        descripcion: 'Convenio colectivo nacional de centros de enseñanza privada de régimen general'
      },
      {
        nombre: 'Convenio Colectivo de Limpieza de Edificios y Locales',
        codigo: '99100125012013',
        descripcion: 'Convenio colectivo sectorial de limpieza de edificios y locales'
      }
    ];

    await queryInterface.bulkInsert('convenios', convenios, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('convenios', null, {});
  }
};