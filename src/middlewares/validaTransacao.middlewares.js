import joi from "joi";

const transacaoSchema = joi.object({
  valor: joi.number().precision(2).required(),
  descricao: joi.string().required(),
  tipo: joi.valid("entrada", "saida").required(),
});

async function validaTransacao(req, res, next) {
  const { valor, descricao, tipo } = req.body;
  const validacao = transacaoSchema.validate(
    { valor, descricao, tipo },
    { abortEarly: false }
  );

  if (validacao.error) {
    const errors = validacao.error.details.map((error) => error.message);
    res.status(422).send({ message: errors });
    return;
  }

  next();
}

export default validaTransacao;
