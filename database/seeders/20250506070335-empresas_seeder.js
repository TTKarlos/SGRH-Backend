'use strict';
const { faker } = require('@faker-js/faker/locale/es');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ No se crearán datos de ejemplo en entorno de producción');
      return;
    }

    const empresas = [];

    empresas.push({
      nombre: 'Tecnologías Avanzadas S.L.',
      cif: 'B12345678',
      direccion: 'Calle Innovación, 123, 28001 Madrid',
      telefono: '912345678',
      email: 'info@tecnoavanzadas.es'
    });

    empresas.push({
      nombre: 'Construcciones Modernas S.A.',
      cif: 'A87654321',
      direccion: 'Avenida de la Edificación, 45, 08001 Barcelona',
      telefono: '932345678',
      email: 'contacto@construccionesmodernas.es'
    });

    empresas.push({
      nombre: 'Servicios Profesionales del Sur S.L.',
      cif: 'B76543210',
      direccion: 'Paseo Marítimo, 78, 29001 Málaga',
      telefono: '952345678',
      email: 'info@serviciosprofesionales.es'
    });

    for (let i = 0; i < 7; i++) {
      const tipoEmpresa = faker.helpers.arrayElement(['S.L.', 'S.A.', 'S.L.U.', 'S.A.U.', 'S.Coop']);
      const nombreEmpresa = `${faker.company.name()} ${tipoEmpresa}`;

      const letras = 'ABCDEFGHJKLMNPQRSUVW';
      const letraCIF = faker.helpers.arrayElement(letras.split(''));
      const numerosCIF = faker.string.numeric(8);
      const cif = `${letraCIF}${numerosCIF}`;

      empresas.push({
        nombre: nombreEmpresa,
        cif: cif,
        direccion: faker.location.streetAddress() + ', ' + faker.location.zipCode() + ' ' + faker.location.city(),
        telefono: faker.phone.number('9########'),
        email: faker.internet.email({ firstName: nombreEmpresa.split(' ')[0].toLowerCase(), lastName: null, provider: 'empresa.es' })
      });
    }

    await queryInterface.bulkInsert('empresas', empresas, {});
    console.log(`✅ Creadas ${empresas.length} empresas de ejemplo`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('empresas', null, {});
  }
};