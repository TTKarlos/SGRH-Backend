/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const roles = await queryInterface.sequelize.query(
          "SELECT id_rol, nombre FROM roles;",
          {
            type: queryInterface.sequelize.QueryTypes.SELECT,
            transaction
          }
      );

      const requiredRoles = ['ADMIN', 'GERENTE', 'RRHH', 'USUARIO'];
      const foundRoles = roles.map(role => role.nombre);

      const missingRoles = requiredRoles.filter(role => !foundRoles.includes(role));
      if (missingRoles.length > 0) {
        throw new Error(`Roles requeridos no encontrados: ${missingRoles.join(', ')}`);
      }

      const roleIds = Object.fromEntries(roles.map(role => [role.nombre, role.id_rol]));

      const permisos = await queryInterface.sequelize.query(
          "SELECT id_permiso, nombre, tipo FROM permisos;",
          {
            type: queryInterface.sequelize.QueryTypes.SELECT,
            transaction
          }
      );

      const permisoIds = {};
      permisos.forEach(permiso => {
        const key = `${permiso.nombre}_${permiso.tipo}`;
        permisoIds[key] = permiso.id_permiso;
      });

      const rolPermisos = {
        ADMIN: Object.values(permisoIds),
        GERENTE: [
          "Usuarios_Lectura",
          "Empleados_Lectura", "Empleados_Escritura",
          "Contratos_Lectura", "Contratos_Escritura",
          "Documentos_Lectura", "Documentos_Escritura",
          "Ausencias_Lectura", "Ausencias_Escritura",
          "Notificaciones_Lectura", "Notificaciones_Escritura"
        ],
        RRHH: [
          "Usuarios_Lectura",
          "Empleados_Lectura", "Empleados_Escritura",
          "Contratos_Lectura", "Contratos_Escritura",
          "Documentos_Lectura", "Documentos_Escritura",
          "Ausencias_Lectura", "Ausencias_Escritura",
          "Notificaciones_Lectura", "Notificaciones_Escritura"
        ],
        USUARIO: [
          "Empleados_Lectura",
          "Documentos_Lectura",
          "Ausencias_Lectura", "Ausencias_Escritura",
          "Notificaciones_Lectura"
        ]
      };

      const asignarPermisosRol = (rolNombre, permisosKeys) => {
        const rolId = roleIds[rolNombre];
        const asignaciones = [];
        let contador = 0;

        if (rolNombre === 'ADMIN') {
          permisosKeys.forEach(id_permiso => {
            asignaciones.push({ id_rol: rolId, id_permiso });
            contador++;
          });
        } else {
          permisosKeys.forEach(key => {
            const id_permiso = permisoIds[key];
            if (id_permiso) {
              asignaciones.push({ id_rol: rolId, id_permiso });
              contador++;
            } else {
              console.log(`Advertencia: Permiso "${key}" no encontrado para ${rolNombre}`);
            }
          });
        }

        console.log(`Asignados ${contador} permisos al rol ${rolNombre}`);
        return asignaciones;
      };

      let permisosRol = [];
      for (const [rolNombre, permisosKeys] of Object.entries(rolPermisos)) {
        permisosRol = permisosRol.concat(asignarPermisosRol(rolNombre, permisosKeys));
      }

      console.log(`Total de permisos a insertar: ${permisosRol.length}`);

      await queryInterface.bulkInsert("permisos_rol", permisosRol, { transaction });

      await transaction.commit();
      console.log("Inserción de permisos completada con éxito");

    } catch (error) {
      await transaction.rollback();
      console.error("Error al asignar permisos a roles:", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.bulkDelete("permisos_rol", null, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};