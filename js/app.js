// SE LLAMA A LAS DEPENDENCIAS DE SERVIDOR, TEMPLATE (EJS, PARA VISTA UNICA) Y A LA API DE PAYPAL QUE VAMOS A USAR
const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

// CON ESTA FUNCIÓN SE LLAMA AL ID FAKE QUE SE SOLICITÓ EN PAYPAL
paypal.configure({
  'mode': 'sandbox', // SANDBOX (MODO PRUEBAS) O LIVE (DE VERDAD)
  'client_id': 'AbzSyaWiQCZXue-9GVpyucRY5wOYnmNzyHX-WwmuxMCbGSIGULZZesrYlVh-7jnWLTiyIF5QcqKAdNSR',
  'client_secret': 'EErOxorPURFBSU8pnY8jztK-Mzq33iadED-DxSNz7UeE7lWug5RsIwGTAW_CXeonmdwFvOlb21RhGNFm'
});

const app = express(); // LLAMANDO A EXPRESS COMO APP PARA QUE MUESTRE LA(S) PÁGINA(S)

app.set('view engine', 'ejs'); // DEFINIENDO QUE EL "MOTOR" QUE VISUALICE LA PÁGINA SEA "EJS"

app.get('/', (req, res) => res.render('index')); // CREANDO LA RUTA CON UN "RENDER"

// REDIRECCIONARA A LA PAGINA DE PAGOS API DE PAYPAL, CREANDO LA RUTA "PAY"
app.post('/pay', (req, res) => {
  const create_payment_json = { // CREA EL ARCHIVO DE JSON CON LA INFORMACION DE PAGO
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/success", // ES DONDE REDIGIRA LA PAGINA UNA VEZ QUE EL PAGO SE HAYA EFECTUADO CON EXITO
      "cancel_url": "http://localhost:3000/cancel" // Y AQUI REDIRIGIRA EN CASO DE QUE EL USUARIO CANCELE LA COMPRA
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "Hamaca para gatitos gordos",
          "sku": "001",
          "price": "50.00",
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": "50.00"
      },
      "description": "Hamaca para que el cucho gordo esté cómodo"
    }]
  };

  // RECIBE LA INFORMACION DEL JSON Y CREA UNA FUNCION PARA QUE CORROBORE SI EL PAGO SE REALIZO CORRECTAMENTE
  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }

  });

});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": "50.00"
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send('Success');
    }

  });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

// LLAMADA PARA INICIAR EL SERVIDOR (POR DEFECTO ES 3000)
app.listen(3000, () => console.log('Servidor iniciado'));