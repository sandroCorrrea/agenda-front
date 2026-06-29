export interface TermoLgpdSecao {
    titulo: string;
    paragrafos: string[];
    itens?: string[];
}

export interface TermoLgpdDadosControlador {
    nomeEmpresa: string;
    emailContato: string;
    endereco: string;
    site: string;
}

export function montarTermoTransparenciaDadosCadastro(
    controlador: TermoLgpdDadosControlador
): TermoLgpdSecao[] {
    const { nomeEmpresa, emailContato, endereco, site } = controlador;

    return [
        {
            titulo: '1. Controlador dos dados',
            paragrafos: [
                `O controlador dos seus dados pessoais é ${nomeEmpresa}, responsável pela plataforma digital disponível em ${site}.`,
                `Para assuntos relacionados à proteção de dados, entre em contato pelo e-mail ${emailContato} ou pelo endereço: ${endereco}.`
            ]
        },
        {
            titulo: '2. Dados pessoais coletados no cadastro',
            paragrafos: [
                'Ao criar sua conta, coletamos os seguintes dados, fornecidos diretamente por você:'
            ],
            itens: [
                'Nome completo',
                'CPF',
                'Data de nascimento',
                'E-mail',
                'Celular',
                'Senha de acesso (armazenada de forma criptografada; não conservamos a senha em texto legível)'
            ]
        },
        {
            titulo: '3. Finalidades do tratamento',
            paragrafos: [
                'Utilizamos seus dados para as finalidades abaixo, sempre em conformidade com a Lei nº 13.709/2018 (LGPD):'
            ],
            itens: [
                'Criar, autenticar e administrar sua conta de usuário na plataforma',
                'Permitir o acesso a funcionalidades como protocolos, avisos, serviços e área do cliente',
                'Enviar comunicações operacionais, como confirmações, alertas de segurança e atualizações do serviço',
                'Prestar atendimento, suporte e responder solicitações',
                'Cumprir obrigações legais, regulatórias e exercer direitos em processos administrativos ou judiciais',
                'Prevenir fraudes, proteger a segurança da plataforma e garantir a integridade dos registros'
            ]
        },
        {
            titulo: '4. Bases legais',
            paragrafos: [
                'O tratamento dos dados informados no cadastro fundamenta-se, conforme o caso, em:'
            ],
            itens: [
                'Execução de contrato ou de procedimentos preliminares relacionados ao cadastro e uso da plataforma (art. 7º, V, LGPD)',
                'Consentimento do titular, quando aplicável, especialmente para comunicações não essenciais (art. 7º, I, LGPD)',
                'Cumprimento de obrigação legal ou regulatória (art. 7º, II, LGPD)',
                'Legítimo interesse para segurança, prevenção a fraudes e melhoria dos serviços, respeitados seus direitos (art. 7º, IX, LGPD)'
            ]
        },
        {
            titulo: '5. Compartilhamento de dados',
            paragrafos: [
                'Seus dados podem ser compartilhados apenas quando necessário, com prestadores de serviços de tecnologia, hospedagem, comunicação e ferramentas de suporte, sempre mediante contratos que exijam o mesmo nível de proteção previsto na LGPD.',
                'Também poderemos compartilhar informações com autoridades públicas quando houver determinação legal, regulatória ou ordem judicial.',
                'Não vendemos nem comercializamos seus dados pessoais.'
            ]
        },
        {
            titulo: '6. Armazenamento e segurança',
            paragrafos: [
                'Os dados são armazenados em ambiente controlado, com medidas técnicas e administrativas de segurança, como controle de acesso, criptografia de credenciais e monitoramento de incidentes.',
                'Conservamos os dados pelo tempo necessário para cumprir as finalidades descritas neste termo, respeitar prazos legais e regulatórios aplicáveis e exercer direitos em eventuais disputas.',
                'Após o encerramento da conta, os dados poderão ser mantidos pelo prazo legal aplicável ou eliminados/anonymizados, conforme a natureza da informação e obrigações em vigor.'
            ]
        },
        {
            titulo: '7. Seus direitos como titular',
            paragrafos: [
                'Nos termos da LGPD, você pode solicitar, a qualquer momento:'
            ],
            itens: [
                'Confirmação da existência de tratamento e acesso aos dados',
                'Correção de dados incompletos, inexatos ou desatualizados',
                'Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade',
                'Portabilidade dos dados a outro fornecedor de serviço, quando aplicável',
                'Eliminação dos dados tratados com base no consentimento, observadas as hipóteses legais de retenção',
                'Informação sobre entidades públicas e privadas com as quais houve compartilhamento',
                'Informação sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa',
                'Revogação do consentimento, quando essa for a base legal do tratamento'
            ]
        },
        {
            titulo: '8. Como exercer seus direitos',
            paragrafos: [
                `Para exercer qualquer direito previsto neste termo, envie solicitação para ${emailContato}, informando seu nome completo, CPF e a descrição do pedido. Poderemos solicitar informações adicionais para confirmar sua identidade antes de atender à requisição.`,
                'Responderemos dentro dos prazos previstos na legislação aplicável.'
            ]
        },
        {
            titulo: '9. Transferência internacional',
            paragrafos: [
                'Caso haja transferência de dados para outros países, adotaremos garantias adequadas previstas na LGPD, como cláusulas contratuais específicas ou mecanismos reconhecidos pela Autoridade Nacional de Proteção de Dados (ANPD).'
            ]
        },
        {
            titulo: '10. Atualizações deste termo',
            paragrafos: [
                'Este Termo de Transparência nos Dados pode ser atualizado para refletir mudanças legais, regulatórias ou operacionais. A versão vigente estará sempre disponível nesta tela de cadastro.',
                'Em alterações relevantes, poderemos comunicá-lo pelos canais cadastrados ou por aviso na plataforma.'
            ]
        },
        {
            titulo: '11. Autoridade de fiscalização',
            paragrafos: [
                'Se entender que o tratamento dos seus dados não atende à LGPD, você pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD), pelo site www.gov.br/anpd.'
            ]
        },
        {
            titulo: '12. Consentimento',
            paragrafos: [
                'Ao marcar a opção de concordância e concluir seu cadastro, você declara ter lido e compreendido este Termo de Transparência nos Dados e autoriza o tratamento dos dados informados para as finalidades aqui descritas.',
                'O não fornecimento de dados obrigatórios para cadastro poderá impedir a criação da conta e o uso das funcionalidades da plataforma.'
            ]
        }
    ];
}
