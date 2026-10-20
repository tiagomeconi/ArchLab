/** Termos de uso e Política de privacidade. Texto-modelo claro, escrito a partir do que o sistema realmente faz hoje: revise com assessoria jurídica antes de divulgar. */
export const LEGAL_VERSION = "2026-10-19";
export type LegalKind = "termos" | "privacidade";
export interface LegalSection { h: string; p?: string[]; ul?: string[] }
export interface LegalDoc { title: string; updated: string; intro: string; sections: LegalSection[] }

const email = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined)?.trim();
const owner = (import.meta.env.VITE_LEGAL_NAME as string | undefined)?.trim();
const ptContact = email ? `pelo e-mail ${email}` : "pelos canais de contato indicados no site do projeto";
const enContact = email ? `at ${email}` : "through the contact channels listed on the project website";
const ptWho = owner ? `O ArchLab é operado por ${owner}` : "O ArchLab é um projeto educacional mantido por seu responsável";
const enWho = owner ? `ArchLab is operated by ${owner}` : "ArchLab is an educational project maintained by its owner";

export const LEGAL: Record<LegalKind, Record<"pt" | "en", LegalDoc>> = {
  privacidade: {
    pt: {
      title: "Política de privacidade", updated: "Atualizada em 19 de outubro de 2026",
      intro: `${ptWho}. Esta política explica, sem rodeios, quais dados pessoais o ArchLab guarda, por quê, com quem eles passam e como você controla tudo isso (Lei Geral de Proteção de Dados, LGPD).`,
      sections: [
        { h: "1. Quais dados coletamos", p: ["Só coletamos o que o sistema precisa para funcionar:"], ul: [
          "Conta: nome completo, data de nascimento, e-mail e senha. A senha nunca é guardada em texto: o provedor de autenticação guarda apenas um hash.",
          "Foto de perfil, se você enviar uma (opcional). Ela é recortada e reduzida no seu navegador antes do envio, e os metadados da imagem (como localização) são removidos.",
          "O que você produz no sistema: progresso e melhor nota por caso, desenhos de arquitetura, anotações, links de compartilhamento que você cria e os dias em que praticou (para a sequência de dias).",
          "Perfil público, somente se você ligar: o @usuário que você escolher.",
          "Dados técnicos mínimos (como endereço IP e registros de acesso) mantidos pela hospedagem e pelo provedor de autenticação, por segurança e prevenção a abusos.",
        ] },
        { h: "2. Para que usamos e em que base legal", ul: [
          "Criar e manter a sua conta e entregar as funções do sistema (execução do contrato).",
          "Proteger o sistema contra fraudes, abusos e ataques (legítimo interesse).",
          "Exibir a sua foto e o seu perfil público, e incluir você no ranking (consentimento, que você pode retirar a qualquer momento).",
          "Cumprir obrigações legais, quando houver.",
        ] },
        { h: "3. O que não fazemos", ul: ["Não vendemos nem alugamos os seus dados.", "Não exibimos anúncios.", "Não usamos rastreadores de publicidade nem ferramentas de análise de terceiros. Se isso mudar, esta política será atualizada antes e você será avisado."] },
        { h: "4. Perfil público e ranking", p: ["Ambos são opcionais e ficam desligados até você ativar em Perfil → Perfil público. Quando ligado, qualquer pessoa com o link vê o seu nome, a foto, a liga, os casos, as conquistas e a sequência de dias, e você aparece no ranking. O seu e-mail, a data de nascimento e os seus desenhos nunca aparecem. Para sair, basta desligar: o perfil e a posição no ranking deixam de ser exibidos na hora."] },
        { h: "5. Com quem compartilhamos", p: ["Usamos prestadores que processam dados em nosso nome: o Supabase (banco de dados, autenticação e armazenamento de arquivos) e o provedor de hospedagem do site. Eles podem processar dados fora do Brasil, com as salvaguardas contratuais e de segurança que oferecem. Só compartilhamos dados com autoridades se a lei exigir."] },
        { h: "6. Dados guardados no seu navegador", p: ["O sistema usa o armazenamento do navegador (localStorage) para manter a sessão, o tema, o idioma, uma cópia local dos seus desenhos e do seu progresso. Não usamos cookies de publicidade. Ao sair da conta, esses dados locais são apagados."] },
        { h: "7. Por quanto tempo guardamos", p: ["Enquanto a sua conta existir. Se você excluir a conta, apagamos os seus dados do banco imediatamente (Perfil → Excluir minha conta). Cópias de segurança do provedor podem manter os dados por um período limitado, até serem sobrescritas pelo ciclo normal de backup."] },
        { h: "8. Seus direitos", p: ["Pela LGPD você pode pedir confirmação de que tratamos seus dados, acesso, correção, portabilidade, informação sobre o compartilhamento, eliminação e a retirada do consentimento. Você exerce a maior parte deles sozinho, em Perfil:"], ul: ["Editar o nome e a data de nascimento.", "Baixar uma cópia de todos os seus dados em um arquivo .json.", "Excluir a conta e todos os dados.", "Ligar ou desligar o perfil público."] },
        { h: "9. Segurança", p: ["Usamos conexão criptografada (HTTPS), senhas protegidas por hash e regras de acesso no banco que impedem uma pessoa de ler os dados de outra. Nenhum sistema é totalmente imune, e por isso recomendamos uma senha forte e única."] },
        { h: "10. Crianças e adolescentes", p: ["O ArchLab é para maiores de 13 anos. Menores de 18 anos devem usar o sistema com o conhecimento e a autorização de um responsável. Se descobrirmos uma conta de alguém com menos de 13 anos, ela será excluída."] },
        { h: "11. Mudanças e contato", p: [`Podemos atualizar esta política. Mudanças relevantes serão avisadas no sistema. Dúvidas ou pedidos sobre dados pessoais: fale conosco ${ptContact}.`] },
      ],
    },
    en: {
      title: "Privacy policy", updated: "Updated October 19, 2026",
      intro: `${enWho}. This policy explains plainly which personal data ArchLab keeps, why, who it is shared with and how you control it (Brazil's General Data Protection Law, LGPD).`,
      sections: [
        { h: "1. What data we collect", p: ["We only collect what the system needs to work:"], ul: [
          "Account: full name, date of birth, email and password. The password is never stored as plain text: the authentication provider keeps only a hash.",
          "Profile photo, if you upload one (optional). It is cropped and downsized in your browser before upload, and image metadata (such as location) is removed.",
          "What you create in the system: progress and best score per case, architecture designs, notes, share links you create and the days you practiced (for the day streak).",
          "Public profile, only if you turn it on: the @username you choose.",
          "Minimal technical data (such as IP address and access logs) kept by the hosting and authentication providers, for security and abuse prevention.",
        ] },
        { h: "2. What we use it for and the legal basis", ul: [
          "Creating and maintaining your account and delivering the system's features (performance of the contract).",
          "Protecting the system against fraud, abuse and attacks (legitimate interest).",
          "Showing your photo and public profile, and listing you in the ranking (consent, which you can withdraw at any time).",
          "Complying with legal obligations, when applicable.",
        ] },
        { h: "3. What we don't do", ul: ["We don't sell or rent your data.", "We don't show ads.", "We don't use advertising trackers or third-party analytics. If that changes, this policy will be updated first and you will be told."] },
        { h: "4. Public profile and ranking", p: ["Both are optional and stay off until you turn them on in Profile → Public profile. When on, anyone with the link sees your name, photo, league, cases, achievements and day streak, and you appear in the ranking. Your email, date of birth and designs never appear. To leave, just turn it off: the profile and your ranking position stop being shown right away."] },
        { h: "5. Who we share it with", p: ["We use providers that process data on our behalf: Supabase (database, authentication and file storage) and the website hosting provider. They may process data outside Brazil, with the contractual and security safeguards they offer. We only share data with authorities when the law requires it."] },
        { h: "6. Data stored in your browser", p: ["The system uses browser storage (localStorage) to keep your session, theme, language, and a local copy of your designs and progress. We don't use advertising cookies. When you sign out, this local data is erased."] },
        { h: "7. How long we keep it", p: ["As long as your account exists. If you delete the account, we erase your data from the database immediately (Profile → Delete my account). The provider's backups may keep data for a limited period until they are overwritten by the normal backup cycle."] },
        { h: "8. Your rights", p: ["Under the LGPD you can ask for confirmation that we process your data, access, correction, portability, information about sharing, deletion and withdrawal of consent. You can do most of this yourself, in Profile:"], ul: ["Edit your name and date of birth.", "Download a copy of all your data as a .json file.", "Delete the account and all data.", "Turn the public profile on or off."] },
        { h: "9. Security", p: ["We use encrypted connections (HTTPS), hashed passwords and database access rules that prevent one person from reading another's data. No system is completely immune, so we recommend a strong, unique password."] },
        { h: "10. Children and teenagers", p: ["ArchLab is for people aged 13 or older. Anyone under 18 should use the system with the knowledge and authorization of a parent or guardian. If we find an account belonging to someone under 13, it will be deleted."] },
        { h: "11. Changes and contact", p: [`We may update this policy. Relevant changes will be announced in the system. Questions or requests about personal data: contact us ${enContact}.`] },
      ],
    },
  },
  termos: {
    pt: {
      title: "Termos de uso", updated: "Atualizados em 19 de outubro de 2026",
      intro: `${ptWho}. Ao criar uma conta ou usar o sistema, você concorda com estes termos. Leia também a Política de privacidade.`,
      sections: [
        { h: "1. O que é o ArchLab", p: ["O ArchLab é um laboratório de system design com fins educacionais. O simulador usa perfis de capacidade fictícios e cálculos simplificados: os números ensinam a raciocinar sobre gargalos, mas não são benchmarks e não substituem testes de carga nem a análise de um engenheiro responsável pelo seu sistema real."] },
        { h: "2. Conta", ul: ["Você precisa ter 13 anos ou mais. Menores de 18 anos devem ter a autorização de um responsável.", "Informe dados verdadeiros e mantenha-os atualizados.", "Você é responsável pela sua senha e por tudo o que acontece na sua conta. Avise-nos se suspeitar de uso indevido.", "Cada pessoa deve ter uma única conta."] },
        { h: "3. Uso aceitável", p: ["Você concorda em não:"], ul: ["tentar acessar dados de outras pessoas, burlar limites ou explorar falhas do sistema;", "usar robôs ou coleta automatizada em larga escala;", "sobrecarregar o serviço de propósito;", "usar nome, @usuário ou foto ofensivos, enganosos ou que se passem por outra pessoa ou marca;", "usar o sistema para qualquer fim ilegal."] },
        { h: "4. O seu conteúdo", p: ["Os desenhos, anotações e demais conteúdos que você cria continuam sendo seus. Você nos dá apenas a permissão necessária para armazená-los e exibi-los da forma que você escolher (por exemplo, ao gerar um link de compartilhamento ou ao ligar o perfil público)."] },
        { h: "5. O nosso conteúdo e marcas de terceiros", p: ["Os casos de estudo, textos, telas e o código do ArchLab são protegidos por direitos autorais, nos termos da licença do projeto. Os logotipos de empresas e tecnologias pertencem aos seus titulares, aparecem de forma ilustrativa e não indicam parceria, patrocínio ou aprovação."] },
        { h: "6. Disponibilidade e garantias", p: ["O serviço é oferecido como está, e podemos alterá-lo, interrompê-lo ou deixar de oferecer recursos. Fazemos o possível para mantê-lo no ar e seguro, mas não garantimos funcionamento ininterrupto nem ausência de erros. Na medida permitida pela lei, não nos responsabilizamos por decisões tomadas com base nos resultados do simulador."] },
        { h: "7. Encerramento", p: ["Você pode excluir a sua conta quando quiser, em Perfil → Excluir minha conta. Podemos suspender ou encerrar contas que violem estes termos, com aviso quando possível."] },
        { h: "8. Mudanças, lei e contato", p: [`Podemos atualizar estes termos; mudanças relevantes serão avisadas no sistema, e continuar usando-o depois delas significa concordar com a nova versão. Estes termos seguem as leis do Brasil. Dúvidas: fale conosco ${ptContact}.`] },
      ],
    },
    en: {
      title: "Terms of use", updated: "Updated October 19, 2026",
      intro: `${enWho}. By creating an account or using the system, you agree to these terms. Please also read the Privacy policy.`,
      sections: [
        { h: "1. What ArchLab is", p: ["ArchLab is a system design lab for educational purposes. The simulator uses fictional capacity profiles and simplified calculations: the numbers teach you to reason about bottlenecks, but they are not benchmarks and do not replace load testing or the analysis of an engineer responsible for your real system."] },
        { h: "2. Account", ul: ["You must be 13 or older. Anyone under 18 needs a parent or guardian's authorization.", "Provide truthful information and keep it up to date.", "You are responsible for your password and for everything that happens in your account. Tell us if you suspect misuse.", "Each person should have a single account."] },
        { h: "3. Acceptable use", p: ["You agree not to:"], ul: ["try to access other people's data, bypass limits or exploit flaws in the system;", "use bots or large-scale automated collection;", "overload the service on purpose;", "use an offensive or misleading name, @username or photo, or impersonate another person or brand;", "use the system for any unlawful purpose."] },
        { h: "4. Your content", p: ["The designs, notes and other content you create remain yours. You give us only the permission needed to store them and show them the way you choose (for example, when you create a share link or turn on the public profile)."] },
        { h: "5. Our content and third-party trademarks", p: ["ArchLab's case studies, texts, screens and code are protected by copyright under the project's license. Company and technology logos belong to their owners, appear for illustration only and do not imply partnership, sponsorship or endorsement."] },
        { h: "6. Availability and warranties", p: ["The service is provided as is, and we may change it, interrupt it or stop offering features. We do our best to keep it up and secure, but we don't guarantee uninterrupted operation or the absence of errors. To the extent permitted by law, we are not liable for decisions made based on the simulator's results."] },
        { h: "7. Termination", p: ["You can delete your account whenever you want, in Profile → Delete my account. We may suspend or end accounts that violate these terms, with notice when possible."] },
        { h: "8. Changes, law and contact", p: [`We may update these terms; relevant changes will be announced in the system, and continuing to use it afterwards means you agree to the new version. These terms follow the laws of Brazil. Questions: contact us ${enContact}.`] },
      ],
    },
  },
};
