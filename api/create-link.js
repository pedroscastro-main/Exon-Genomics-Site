const EXAMS = {
  genoma:       { title: 'Genoma Completo',               price: 599000 },
  cancer:       { title: 'Painel Oncológico',             price: 499000 },
  cardiologia:  { title: 'Painel Cardiológico',           price: 499000 },
  hormonios:    { title: 'Painel Endócrino',              price: 499000 },
  neuro:        { title: 'Painel Neurogenética',          price: 499000 },
  planejamento: { title: 'Planejamento Familiar (casal)', price: 999000 },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { examId } = req.body || {};
  const exam = EXAMS[examId];
  if (!exam) return res.status(400).json({ error: 'Exame inválido' });

  try {
    const response = await fetch('https://api.checkout.infinitepay.io/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle: 'pedroscastro',
        redirect_url: 'https://www.exongenomics.com/home-editorial',
        webhook_url: 'https://www.exongenomics.com/api/webhook',
        items: [{
          quantity: 1,
          price: exam.price,
          description: exam.title,
        }],
      }),
    });

    const data = await response.json();
    if (!data.url) throw new Error('URL não retornada');
    res.json({ url: data.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar link de pagamento' });
  }
};
