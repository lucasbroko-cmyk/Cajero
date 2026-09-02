function guardarUsuarios(usuarios) {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function cargarUsuarios() {
  const datos = localStorage.getItem("usuarios");
  return datos ? JSON.parse(datos) : [];
}

/* -------------------- REGISTRO -------------------- */

function registrarUsuario(usuarios) {
  const nombre = prompt("Ingresa tu nombre de usuario:");

  if (!nombre || nombre.trim() === "") {
    console.log("El nombre no puede estar vacío.");
    return usuarios;
  }

  const existe = usuarios.find(u => u.nombre === nombre);
  if (existe) {
    console.log("Ese nombre de usuario ya está registrado.");
    return usuarios;
  }

  const clave = prompt("Ingresa una clave:");
  if (!clave || clave.trim() === "") {
    console.log("La clave no puede estar vacía.");
    return usuarios;
  }

  const saldoTexto = prompt("Ingresa el saldo inicial:");
  const saldoInicial = Number(saldoTexto);

  if (isNaN(saldoInicial) || saldoInicial < 0) {
    console.log("El saldo debe ser un número válido y no negativo.");
    return usuarios;
  }

  const nuevoUsuario = {
    nombre: nombre,
    clave: clave,
    saldo: saldoInicial,
    intentosFallidos: 0,
    bloqueado: false,
    movimientos: []
  };

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);
  console.log(`Usuario "${nombre}" registrado con éxito.`);

  return usuarios;
}

/* -------------------- LOGIN -------------------- */

function iniciarSesion(usuarios) {
  const nombre = prompt("Usuario:");
  const usuario = usuarios.find(u => u.nombre === nombre);

  if (!usuario) {
    console.log("Ese usuario no existe.");
    return null;
  }

  if (usuario.bloqueado) {
    console.log("Cuenta bloqueada por 24 horas, comunícate con tu banco.");
    alert("Usuario bloqueado");
    return null;
  }

  let intentos = 0;
  let autenticado = false;

  while (intentos < 3 && !autenticado) {
    const clave = prompt(`Clave (intento ${intentos + 1} de 3):`);

    if (clave === usuario.clave) {
      autenticado = true;
    } else {
      intentos++;
      console.log(`Clave incorrecta. Intentos restantes: ${3 - intentos}`);
    }
  }

  if (autenticado) {
    usuario.intentosFallidos = 0;
    console.log(`Bienvenido, ${usuario.nombre}.`);
    return usuario;
  } else {
    usuario.bloqueado = true;
    guardarUsuarios(usuarios);
    console.log("Cuenta bloqueada por 24 horas, comunícate con tu banco.");
    return null;
  }
}

/* -------------------- MOVIMIENTOS -------------------- */

function registrarMovimiento(usuario, concepto, valor) {
  usuario.movimientos.push({
    fecha: new Date().toLocaleString(),
    concepto: concepto,
    valor: valor,
    saldo: usuario.saldo
  });
}

/* -------------------- TRANSACCIONES -------------------- */

function retirar(usuario, usuarios) {
  const montoTexto = prompt("¿Cuánto deseas retirar?");
  const monto = Number(montoTexto);

  if (isNaN(monto) || monto <= 0) {
    console.log("El monto debe ser un número positivo.");
    return;
  }

  if (monto > usuario.saldo) {
    console.log("Fondos insuficientes. Tu saldo actual es: " + usuario.saldo);
    return;
  }

  usuario.saldo -= monto;
  registrarMovimiento(usuario, "Retiro", monto);
  guardarUsuarios(usuarios);
  console.log("Retiro exitoso. Nuevo saldo: " + usuario.saldo);
}

function consignar(usuario, usuarios) {
  const montoTexto = prompt("¿Cuánto deseas consignar?");
  const monto = Number(montoTexto);

  if (isNaN(monto) || monto <= 0) {
    console.log("El monto debe ser un número positivo.");
    return;
  }

  usuario.saldo += monto;
  registrarMovimiento(usuario, "Consignación", monto);
  guardarUsuarios(usuarios);
  console.log("Consignación exitosa. Nuevo saldo: " + usuario.saldo);
}

function consultarSaldo(usuario) {
  console.log(`Tu saldo actual es: ${usuario.saldo}`);
}

function consultarMovimientos(usuario) {
  if (usuario.movimientos.length === 0) {
    console.log("Aún no tienes movimientos registrados.");
    return;
  }

  console.log("=== Historial de Movimientos ===");
  for (let i = 0; i < usuario.movimientos.length; i++) {
    const m = usuario.movimientos[i];
    console.log(`${m.fecha} | ${m.concepto} | Valor: ${m.valor} | Saldo: ${m.saldo}`);
  }
}

/* -------------------- MENÚ DE TRANSACCIONES -------------------- */

function menuTransacciones(usuario, usuarios) {
  while (true) {
    const opcion = prompt(
      "1. Retirar\n2. Consignar\n3. Consultar Saldo\n4. Consultar Movimientos\n5. Salir\n\nElige una opción:"
    );

    switch (opcion) {
      case "1":
        retirar(usuario, usuarios);
        break;
      case "2":
        consignar(usuario, usuarios);
        break;
      case "3":
        consultarSaldo(usuario);
        break;
      case "4":
        consultarMovimientos(usuario);
        break;
      case "5":
        console.log(`Hasta pronto, ${usuario.nombre}.`);
        return; // regresa al menú principal
      default:
        console.log("Opción inválida, intenta de nuevo.");
    }
  }
}

/* -------------------- MENÚ PRINCIPAL -------------------- */

function menuPrincipal() {
  let usuarios = cargarUsuarios();

  while (true) {
    const opcion = prompt("1. Iniciar\n2. Registrar\n3. Salir\n\nElige una opción:");

    switch (opcion) {
      case "1":
        const usuarioLogueado = iniciarSesion(usuarios);
        if (usuarioLogueado) {
          menuTransacciones(usuarioLogueado, usuarios);
        }
        break;
      case "2":
        usuarios = registrarUsuario(usuarios);
        break;
      case "3":
        console.log("Gracias por usar Este cajero.");
        return;
      default:
        console.log("Opción inválida, intenta de nuevo.");
    }
  }
}

/* -------------------- INICIO DEL PROGRAMA -------------------- */

menuPrincipal();