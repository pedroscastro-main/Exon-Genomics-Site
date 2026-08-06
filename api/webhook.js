module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const event = req.body;
  console.log('InfinitePay webhook:', JSON.stringify(event));

  // Aqui você pode adicionar lógica futura:
  // - enviar e-mail de confirmação ao paciente
  // - registrar pedido no sistema interno
  // - acionar o CRM

  res.status(200).json({ received: true });
};
