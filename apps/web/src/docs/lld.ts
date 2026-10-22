import { h, p, ul, tip, code, table, fig, node, edge, type DocArticle } from "./kit";

/** Seção "lld". */
export const ARTICLES: DocArticle[] = [
  { id: "o-que-e-low-level-design", section: "lld", level: 0, icon: "schema", minutes: 9,
    title: ["O que é Low Level Design", "What Low Level Design is"],
    summary: ["A camada de detalhe: classes, interfaces e fluxos dentro de um componente, e o que um bom LLD entrega.", "The detail layer: classes, interfaces and flows inside a component, and what a good LLD delivers."],
    body: [
      p(["Quando alguém desenha um sistema para milhões de usuários, a primeira conversa é sobre caixas e setas: um balanceador, alguns serviços, um banco, uma fila. Essa visão de cima é o **High Level Design (HLD)**. Só que cada caixa dessas, em algum momento, vira código, e o código precisa de uma organização própria: quais classes existem, o que cada uma sabe e faz, como conversam e onde cada regra de negócio mora. Esse desenho interno de um componente é o **Low Level Design (LLD)**, também chamado de *design de baixo nível* ou *design detalhado*.", "When someone designs a system for millions of users, the first conversation is about boxes and arrows: a load balancer, a few services, a database, a queue. That top-down view is the **High Level Design (HLD)**. But every one of those boxes eventually becomes code, and code needs its own organization: which classes exist, what each one knows and does, how they talk and where each business rule lives. That internal design of a component is the **Low Level Design (LLD)**, also called *detailed design*."]),
      p(["A importância do LLD aparece com o tempo. Um sistema com arquitetura perfeita e classes caóticas funciona no primeiro mês e se torna impossível de mudar no segundo ano: cada nova regra exige mexer em dez lugares, cada correção quebra outra coisa e ninguém consegue escrever um teste sem subir o banco inteiro. O LLD é a disciplina que mantém o custo de mudança baixo.", "The importance of LLD shows over time. A system with a perfect architecture and chaotic classes works in the first month and becomes impossible to change in the second year: every new rule requires touching ten places, every fix breaks something else and nobody can write a test without starting the whole database. LLD is the discipline that keeps the cost of change low."]),
      fig(["Do sistema ao código: onde cada nível de design atua", "From system to code: where each design level acts"], [
        [node("sys", ["Sistema completo", "Whole system"], "client")],
        [node("hld", "HLD", "edge")],
        [node("cmp", ["Componente (serviço)", "Component (service)"], "service")],
        [node("lld", "LLD", "edge")],
        [node("cls", ["Classes e interfaces", "Classes and interfaces"], "data")],
      ], [edge("sys", "hld", ["decompõe", "decomposes"]), edge("hld", "cmp"), edge("cmp", "lld", ["detalha", "details"]), edge("lld", "cls")]),
      h(["HLD x LLD", "HLD vs LLD"]),
      p(["Os dois níveis se complementam, mas respondem a perguntas diferentes e usam ferramentas diferentes. A tabela resume as diferenças mais importantes.", "The two levels complement each other, but they answer different questions and use different tools. The table summarizes the most important differences."]),
      table([["Aspecto", "Aspect"], ["HLD", "HLD"], ["LLD", "LLD"]],
        [["Pergunta central", "Central question"], ["Quais componentes existem e como se comunicam?", "Which components exist and how do they communicate?"], ["Como cada componente é organizado por dentro?", "How is each component organized inside?"]],
        [["Unidade de trabalho", "Unit of work"], ["Serviços, bancos, filas, caches, redes", "Services, databases, queues, caches, networks"], ["Classes, interfaces, métodos, módulos", "Classes, interfaces, methods, modules"]],
        [["Preocupações", "Concerns"], ["Escala, disponibilidade, latência, custo, consistência", "Scale, availability, latency, cost, consistency"], ["Legibilidade, extensibilidade, testabilidade, coesão", "Readability, extensibility, testability, cohesion"]],
        [["Artefatos típicos", "Typical artifacts"], ["Diagrama de arquitetura, estimativas de capacidade, escolha de tecnologias", "Architecture diagram, capacity estimates, technology choices"], ["Diagrama de classes, de sequência, interfaces, esquema de tabelas, código de exemplo", "Class diagram, sequence diagram, interfaces, table schema, sample code"]],
        [["Quem decide", "Who decides"], ["Arquitetos e líderes técnicos, com o time", "Architects and tech leads, with the team"], ["Qualquer pessoa que escreve o código, com revisão", "Anyone writing the code, with review"]],
        [["Custo de errar", "Cost of getting it wrong"], ["Alto: migrar banco ou separar serviço leva meses", "High: migrating a database or splitting a service takes months"], ["Menor, mas se acumula a cada linha escrita", "Lower, but it accumulates with every line written"]],
      ),
      p(["Na prática a fronteira é fluida. Decidir que existe um serviço de pagamentos é HLD; decidir que esse serviço tem uma interface `PaymentGateway` com implementações para dois provedores é LLD. Muitas entrevistas pedem os dois em sequência: primeiro o desenho de alto nível, depois o detalhe de um componente escolhido.", "In practice the boundary is fluid. Deciding that a payments service exists is HLD; deciding that this service has a `PaymentGateway` interface with implementations for two providers is LLD. Many interviews ask for both in sequence: first the high-level design, then the detail of a chosen component."]),
      h(["O que um LLD entrega", "What an LLD delivers"]),
      p(["Não existe formato único, mas um LLD sólido costuma conter os itens abaixo. Em um projeto real, eles aparecem em um documento de design curto, em diagramas e, principalmente, em interfaces escritas no próprio código.", "There is no single format, but a solid LLD usually contains the items below. In a real project they appear in a short design document, in diagrams and, above all, in interfaces written in the code itself."]),
      ul(
        ["**Requisitos e escopo**: o que o componente faz, o que não faz e quais casos de uso ele cobre.", "**Requirements and scope**: what the component does, what it does not do and which use cases it covers."],
        ["**Entidades e responsabilidades**: as classes principais, o que cada uma guarda (estado) e o que sabe fazer (comportamento).", "**Entities and responsibilities**: the main classes, what each one holds (state) and what it can do (behavior)."],
        ["**Relacionamentos**: quem contém quem, quem depende de quem, onde há herança ou composição.", "**Relationships**: who contains whom, who depends on whom, where there is inheritance or composition."],
        ["**Interfaces e contratos**: os pontos onde o sistema pode ser estendido ou trocado, com assinaturas e regras (pré-condições, erros).", "**Interfaces and contracts**: the points where the system can be extended or swapped, with signatures and rules (preconditions, errors)."],
        ["**Fluxos principais**: como os objetos colaboram em cada caso de uso, normalmente em um diagrama de sequência.", "**Main flows**: how objects collaborate in each use case, usually in a sequence diagram."],
        ["**Modelo de dados**: tabelas ou documentos que persistem as entidades, com chaves e índices.", "**Data model**: tables or documents that persist the entities, with keys and indexes."],
        ["**Tratamento de erros e concorrência**: o que acontece quando algo falha ou quando dois usuários agem ao mesmo tempo.", "**Error handling and concurrency**: what happens when something fails or two users act at the same time."],
        ["**Pontos de extensão**: o que é provável mudar e como o design absorve essa mudança sem reescrita.", "**Extension points**: what is likely to change and how the design absorbs that change without a rewrite."],
      ),
      h(["Como se faz um LLD, passo a passo", "How to do an LLD, step by step"]),
      p(["Um roteiro simples serve tanto para o trabalho do dia a dia quanto para entrevistas. Ele é iterativo: ao desenhar as classes você descobre requisitos que faltavam e volta um passo.", "A simple roadmap works both for day-to-day work and for interviews. It is iterative: while drawing the classes you discover missing requirements and step back."]),
      ul(
        ["**1. Esclareça os requisitos.** Liste atores (quem usa), casos de uso e restrições. Pergunte o que fica de fora. Um sistema de estacionamento tem multas? Aceita reservas?", "**1. Clarify requirements.** List actors (who uses it), use cases and constraints. Ask what is out of scope. Does a parking system have fines? Does it accept reservations?"],
        ["**2. Encontre as entidades.** Uma técnica clássica é sublinhar os **substantivos** do enunciado (candidatos a classes) e os **verbos** (candidatos a métodos). Descarte o que é só atributo ou sinônimo.", "**2. Find the entities.** A classic technique is to underline the **nouns** in the statement (class candidates) and the **verbs** (method candidates). Discard what is just an attribute or a synonym."],
        ["**3. Atribua responsabilidades.** Para cada comportamento, pergunte qual objeto tem a informação necessária. Quem tem os dados deve ter a operação.", "**3. Assign responsibilities.** For each behavior, ask which object has the information needed. Whoever has the data should have the operation."],
        ["**4. Defina relacionamentos e interfaces.** Decida o que é herança, composição ou só dependência, e extraia interfaces onde há variação previsível.", "**4. Define relationships and interfaces.** Decide what is inheritance, composition or mere dependency, and extract interfaces where variation is predictable."],
        ["**5. Aplique princípios e padrões com critério.** SOLID e padrões de projeto são ferramentas; use-os quando resolvem um problema que você realmente tem.", "**5. Apply principles and patterns with judgment.** SOLID and design patterns are tools; use them when they solve a problem you actually have."],
        ["**6. Valide com fluxos.** Percorra os casos de uso passo a passo sobre o desenho. Se um fluxo exige gambiarra, o desenho precisa de ajuste.", "**6. Validate with flows.** Walk the use cases step by step over the design. If a flow needs a hack, the design needs adjusting."],
        ["**7. Escreva o esqueleto em código.** Interfaces, classes e assinaturas compilando já revelam falhas que um diagrama esconde.", "**7. Write the skeleton in code.** Interfaces, classes and signatures that compile already reveal flaws a diagram hides."],
      ),
      code(`// Step 2 in practice. Statement: "A member borrows a book; a library keeps copies."
// Nouns  -> Member, Book, Library, Copy   (classes)
// Verbs  -> borrow, keep                  (methods)
class Book { constructor(readonly isbn: string, readonly title: string) {} }
class Copy { constructor(readonly id: string, readonly book: Book, public onLoan = false) {} }
class Member {
  private loans: Copy[] = [];
  borrow(copy: Copy): void {
    if (copy.onLoan) throw new Error("copy already on loan");
    copy.onLoan = true;
    this.loans.push(copy);
  }
}
class Library { private copies = new Map<string, Copy>(); add(c: Copy) { this.copies.set(c.id, c); } }`),
      h(["Qualidades de um bom design", "Qualities of a good design"]),
      p(["Como saber se um LLD é bom? Não há métrica única, mas algumas propriedades aparecem de forma consistente em bases de código saudáveis.", "How do you know whether an LLD is good? There is no single metric, but some properties appear consistently in healthy codebases."]),
      table([["Propriedade", "Property"], ["O que significa", "What it means"], ["Sinal de problema", "Warning sign"]],
        [["Coesão", "Cohesion"], ["Cada classe tem um propósito claro e suas partes trabalham juntas", "Each class has a clear purpose and its parts work together"], ["Classes chamadas Manager, Helper ou Utils com dezenas de métodos sem relação", "Classes called Manager, Helper or Utils with dozens of unrelated methods"]],
        [["Baixo acoplamento", "Low coupling"], ["Uma classe conhece pouco sobre as outras e depende de abstrações", "A class knows little about the others and depends on abstractions"], ["Mudar um campo obriga a alterar muitos arquivos", "Changing one field forces edits in many files"]],
        [["Extensibilidade", "Extensibility"], ["Novos comportamentos entram sem alterar código existente", "New behaviors are added without changing existing code"], ["Cadeias longas de if/else por tipo que crescem a cada requisito", "Long if/else chains by type that grow with every requirement"]],
        [["Testabilidade", "Testability"], ["Dá para testar uma regra isolada, com dependências substituíveis", "A rule can be tested in isolation, with replaceable dependencies"], ["Testes que exigem rede, relógio real ou banco para validar um cálculo", "Tests that need network, real clock or a database to check a calculation"]],
        [["Legibilidade", "Readability"], ["Os nomes contam a intenção do negócio", "Names tell the business intent"], ["Comentários explicando o que o código faz porque os nomes não ajudam", "Comments explaining what the code does because names do not help"]],
      ),
      h(["Armadilhas comuns", "Common pitfalls"]),
      ul(
        ["**Superengenharia.** Criar dez interfaces e cinco padrões para um problema que cabe em duas classes. Complexidade que não resolve problema é custo puro.", "**Over-engineering.** Creating ten interfaces and five patterns for a problem that fits in two classes. Complexity that solves no problem is pure cost."],
        ["**Modelo anêmico.** Classes que só guardam dados, enquanto toda a lógica fica em serviços gigantes. Perde-se o benefício de agrupar estado e comportamento.", "**Anemic model.** Classes that only hold data while all logic sits in giant services. You lose the benefit of grouping state and behavior."],
        ["**Herança por conveniência.** Herdar só para reaproveitar código cria hierarquias frágeis; prefira composição.", "**Inheritance for convenience.** Inheriting just to reuse code creates fragile hierarchies; prefer composition."],
        ["**Ignorar concorrência e erros.** Um desenho que só descreve o caminho feliz quebra no primeiro uso real.", "**Ignoring concurrency and errors.** A design that only describes the happy path breaks on the first real use."],
        ["**Desenhar sem requisitos.** Sem saber o que muda com frequência, qualquer abstração é um palpite.", "**Designing without requirements.** Without knowing what changes often, any abstraction is a guess."],
      ),
      h(["Onde o LLD aparece na vida real", "Where LLD shows up in real life"]),
      p(["Todo código que você revisa em um pull request carrega decisões de LLD: onde colocar uma regra nova, se criar uma interface, se um método pertence a esta classe ou àquela. Em entrevistas, perguntas como projetar um estacionamento, um elevador, um caixa eletrônico, um sistema de reservas de assentos ou um jogo de tabuleiro avaliam exatamente isso: você consegue transformar um enunciado vago em classes coesas, extensíveis e testáveis? Frameworks populares também são LLD cristalizado: o contêiner de injeção de dependências do Spring ou do NestJS, o roteamento de middlewares do Express e os componentes do React expressam escolhas de responsabilidade e acoplamento que você pode estudar.", "All code you review in a pull request carries LLD decisions: where to put a new rule, whether to create an interface, whether a method belongs to this class or that one. In interviews, questions such as designing a parking lot, an elevator, an ATM, a seat reservation system or a board game evaluate exactly this: can you turn a vague statement into cohesive, extensible and testable classes? Popular frameworks are also crystallized LLD: the dependency injection container of Spring or NestJS, the middleware routing of Express and React components express choices about responsibility and coupling that you can study."]),
      h(["Resumo", "Summary"]),
      ul(
        ["HLD define os componentes e como se comunicam; LLD define como cada componente é organizado por dentro.", "HLD defines the components and how they communicate; LLD defines how each component is organized inside."],
        ["Um LLD entrega entidades, responsabilidades, relacionamentos, interfaces, fluxos, modelo de dados e tratamento de erros e concorrência.", "An LLD delivers entities, responsibilities, relationships, interfaces, flows, a data model and error and concurrency handling."],
        ["O roteiro é: requisitos, entidades (substantivos e verbos), responsabilidades, relacionamentos, princípios, validação por fluxos e esqueleto em código.", "The roadmap is: requirements, entities (nouns and verbs), responsibilities, relationships, principles, validation by flows and a code skeleton."],
        ["Bom design significa coesão, baixo acoplamento, extensibilidade e testabilidade, sem exageros.", "Good design means cohesion, low coupling, extensibility and testability, without excess."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**LLD é só diagrama de classes?** Não. O diagrama é uma das saídas; o essencial são as decisões de responsabilidade, interfaces e fluxos, que podem ser expressas em código.", "**Is LLD just a class diagram?** No. The diagram is one output; the essentials are the decisions about responsibilities, interfaces and flows, which can be expressed in code."],
        ["**Preciso de LLD em projetos pequenos?** Em escala reduzida, sim: bastam alguns minutos para decidir as classes principais antes de codar.", "**Do I need LLD in small projects?** At a reduced scale, yes: a few minutes to decide the main classes before coding is enough."],
        ["**Devo usar padrões de projeto sempre?** Não. Use quando houver o problema que o padrão resolve. Padrões aplicados sem necessidade pioram o código.", "**Should I always use design patterns?** No. Use them when the problem they solve exists. Patterns applied without need make the code worse."],
        ["**Qual linguagem usar em entrevistas?** A que você domina e que tenha interfaces e classes claras; Java, C#, TypeScript e Python são comuns. O que importa é o raciocínio.", "**Which language should I use in interviews?** One you master and that has clear classes and interfaces; Java, C#, TypeScript and Python are common. The reasoning is what matters."],
      ),
      tip(["Um bom teste do seu LLD: escolha o requisito mais provável de mudar e conte quantos arquivos você precisaria alterar. Se a resposta for um ou dois, o design está fazendo seu trabalho.", "A good test of your LLD: pick the requirement most likely to change and count how many files you would need to edit. If the answer is one or two, the design is doing its job."]),
    ] },
  { id: "programacao-orientada-a-objetos", section: "lld", level: 0, icon: "category", minutes: 11,
    title: ["Programação orientada a objetos", "Object-oriented programming"],
    summary: ["Classes, objetos, os quatro pilares, composição x herança e os relacionamentos entre classes.", "Classes, objects, the four pillars, composition vs inheritance and the relationships between classes."],
    body: [
      p(["A **programação orientada a objetos (POO)** organiza um programa como um conjunto de **objetos** que guardam dados e oferecem operações sobre eles, colaborando por meio de mensagens (chamadas de métodos). Em vez de pensar em uma lista de passos que manipula estruturas soltas, você pensa em entidades do problema (conta, pedido, vaga, usuário) e em quem é responsável por quê. É o modelo dominante em Java, C#, Kotlin, TypeScript e, em boa parte, Python, e é a base sobre a qual SOLID e os padrões de projeto foram escritos.", "**Object-oriented programming (OOP)** organizes a program as a set of **objects** that hold data and offer operations on it, collaborating through messages (method calls). Instead of thinking of a list of steps manipulating loose structures, you think of problem entities (account, order, spot, user) and who is responsible for what. It is the dominant model in Java, C#, Kotlin, TypeScript and, to a large extent, Python, and it is the base on which SOLID and design patterns were written."]),
      h(["Classes e objetos", "Classes and objects"]),
      p(["Uma **classe** é a planta: descreve quais dados (atributos ou campos) e quais operações (métodos) um tipo de objeto tem. Um **objeto** é uma instância concreta dessa planta, com seus próprios valores. O **estado** de um objeto é o conjunto de valores dos seus campos em um momento; o **comportamento** é o que ele sabe fazer. O **construtor** garante que o objeto nasça em um estado válido, e a **identidade** distingue dois objetos mesmo quando têm os mesmos valores (duas contas com saldo zero continuam sendo contas diferentes).", "A **class** is the blueprint: it describes which data (attributes or fields) and which operations (methods) an object type has. An **object** is a concrete instance of that blueprint, with its own values. An object's **state** is the set of its field values at a moment; its **behavior** is what it can do. The **constructor** guarantees the object is born in a valid state, and **identity** tells two objects apart even when they hold the same values (two accounts with zero balance are still different accounts)."]),
      code(`class BankAccount {
  private balance = 0;                       // state, hidden from outside
  constructor(readonly id: string, private owner: string) {}

  deposit(amount: number): void {            // behavior that protects invariants
    if (amount <= 0) throw new Error("amount must be positive");
    this.balance += amount;
  }
  withdraw(amount: number): void {
    if (amount > this.balance) throw new Error("insufficient funds");
    this.balance -= amount;
  }
  getBalance(): number { return this.balance; }
}
const acc = new BankAccount("a-1", "Ana");  // an object (instance)
acc.deposit(100);`),
      h(["Os quatro pilares", "The four pillars"]),
      fig(["Os quatro pilares e o que cada um protege", "The four pillars and what each one protects"], [
        [node("enc", ["Encapsulamento", "Encapsulation"], "service"), node("abs", ["Abstração", "Abstraction"], "service")],
        [node("inh", ["Herança", "Inheritance"], "edge"), node("pol", "Polimorfismo", "edge")],
        [node("goal1", ["Invariantes seguras", "Safe invariants"], "data"), node("goal2", ["Código extensível", "Extensible code"], "data")],
      ], [edge("enc", "goal1"), edge("abs", "goal2"), edge("inh", "pol", ["habilita", "enables"]), edge("pol", "goal2"), edge("abs", "pol", ["interfaces", "interfaces"], { dashed: true })]),
      p(["**Encapsulamento** é esconder o estado interno e expor apenas operações que preservam as regras do objeto. Se o saldo só muda por `deposit` e `withdraw`, nenhum código externo consegue deixá-lo negativo. O benefício é poder mudar a representação interna (guardar centavos em inteiro em vez de decimal) sem quebrar quem usa a classe. Um erro comum é gerar getters e setters para tudo, o que apenas reexpõe os campos com mais cerimônia; prefira métodos com significado de negócio, como `transfer`, em vez de `setBalance`.", "**Encapsulation** is hiding internal state and exposing only operations that preserve the object's rules. If the balance only changes through `deposit` and `withdraw`, no external code can make it negative. The benefit is being able to change the internal representation (storing cents as an integer instead of a decimal) without breaking users of the class. A common mistake is generating getters and setters for everything, which merely re-exposes the fields with more ceremony; prefer methods with business meaning, such as `transfer`, over `setBalance`."]),
      p(["**Abstração** é mostrar o essencial e ocultar o detalhe. Quem usa um `PaymentGateway` sabe que pode `charge(valor)`; não precisa saber se por baixo há HTTP, filas ou um SDK. Abstrair é decidir o que importa para quem consome. Em código, aparece como interfaces e classes abstratas; no projeto, como a escolha dos nomes e do nível de detalhe do modelo.", "**Abstraction** is showing the essential and hiding the detail. Whoever uses a `PaymentGateway` knows they can `charge(amount)`; they do not need to know whether underneath there is HTTP, queues or an SDK. To abstract is to decide what matters to the consumer. In code it appears as interfaces and abstract classes; in design, as the choice of names and the level of detail of the model."]),
      p(["**Herança** permite que uma classe (a subclasse) reaproveite e especialize outra (a superclasse), formando uma relação do tipo *é um*. É poderosa, mas cria o acoplamento mais forte da POO: a subclasse depende dos detalhes da superclasse e qualquer mudança nela pode quebrar as filhas. Por isso se diz que herança deve modelar uma relação genuína de substituição, não ser um atalho para reaproveitar código.", "**Inheritance** lets one class (the subclass) reuse and specialize another (the superclass), forming an *is-a* relationship. It is powerful, but it creates the strongest coupling in OOP: the subclass depends on the superclass's details and any change there can break the children. That is why inheritance should model a genuine substitution relationship, not be a shortcut to reuse code."]),
      p(["**Polimorfismo** é a capacidade de tratar objetos de tipos diferentes pela mesma interface, deixando cada um responder do seu jeito. É o que elimina cadeias de `if (tipo === ...)`: o código chama `shape.area()` e cada forma calcula a sua área. Existe o polimorfismo de **subtipo** (via herança ou interface, resolvido em tempo de execução), o **paramétrico** (genéricos, como `List<T>`) e o de **sobrecarga** (mesmo nome, parâmetros diferentes, resolvido na compilação).", "**Polymorphism** is the ability to treat objects of different types through the same interface, letting each one respond in its own way. It is what eliminates `if (type === ...)` chains: the code calls `shape.area()` and each shape computes its own area. There is **subtype** polymorphism (via inheritance or interface, resolved at run time), **parametric** (generics, such as `List<T>`) and **overloading** (same name, different parameters, resolved at compile time)."]),
      code(`abstract class Shape {
  abstract area(): number;                   // contract
  describe(): string { return this.constructor.name + " " + this.area().toFixed(2); }
}
class Circle extends Shape {
  constructor(private r: number) { super(); }
  area() { return Math.PI * this.r ** 2; }
}
class Rect extends Shape {
  constructor(private w: number, private h: number) { super(); }
  area() { return this.w * this.h; }
}
const shapes: Shape[] = [new Circle(1), new Rect(2, 3)];
for (const s of shapes) console.log(s.describe());   // no type checks needed`),
      h(["Composição x herança", "Composition vs inheritance"]),
      p(["Uma máxima antiga do livro dos padrões diz: *prefira composição a herança*. **Composição** significa montar um objeto a partir de outros que ele possui e aos quais delega trabalho (relação *tem um*). A diferença é que a composição pode ser trocada em tempo de execução e não herda detalhes internos. Considere um pato: se `RubberDuck` herda de `Duck` só para reaproveitar `swim`, ele também herda `fly`, que não faz sentido. Com composição, o pato *tem um* comportamento de voo que pode ser `CanFly` ou `CannotFly`.", "An old maxim from the patterns book says: *favor composition over inheritance*. **Composition** means building an object from others that it owns and delegates work to (a *has-a* relationship). The difference is that composition can be swapped at run time and does not inherit internal details. Consider a duck: if `RubberDuck` inherits from `Duck` just to reuse `swim`, it also inherits `fly`, which makes no sense. With composition, the duck *has a* flight behavior that can be `CanFly` or `CannotFly`."]),
      code(`interface FlyBehavior { fly(): string }
class CanFly implements FlyBehavior { fly() { return "flapping wings"; } }
class CannotFly implements FlyBehavior { fly() { return "cannot fly"; } }

class Duck {
  constructor(private flyBehavior: FlyBehavior) {}   // composition
  setFly(b: FlyBehavior) { this.flyBehavior = b; }   // changeable at run time
  performFly() { return this.flyBehavior.fly(); }
}
const rubber = new Duck(new CannotFly());`),
      table([["Critério", "Criterion"], ["Herança", "Inheritance"], ["Composição", "Composition"]],
        [["Relação", "Relationship"], ["é um", "is-a"], ["tem um / usa um", "has-a / uses-a"]],
        [["Acoplamento", "Coupling"], ["Forte, à implementação da superclasse", "Strong, to the superclass implementation"], ["Fraco, à interface do colaborador", "Weak, to the collaborator's interface"]],
        [["Mudança em tempo de execução", "Run-time change"], ["Não, o tipo é fixo", "No, the type is fixed"], ["Sim, basta trocar o colaborador", "Yes, just swap the collaborator"]],
        [["Reuso", "Reuse"], ["Automático, mas rígido", "Automatic, but rigid"], ["Explícito, mais flexível", "Explicit, more flexible"]],
        [["Quando usar", "When to use"], ["Substituição genuína e hierarquia estável", "Genuine substitution and a stable hierarchy"], ["Quase sempre; é o padrão de partida", "Almost always; it is the default starting point"]],
      ),
      h(["Classe abstrata x interface", "Abstract class vs interface"]),
      p(["Os dois definem contratos, mas com papéis diferentes. Uma **interface** descreve apenas *o quê*: um conjunto de operações que um tipo promete oferecer, sem estado nem implementação (em algumas linguagens permite métodos padrão). Uma **classe abstrata** é uma classe incompleta: pode guardar estado, ter métodos concretos e deixar alguns abstratos para as filhas completarem. Uma classe pode implementar várias interfaces, mas em Java, C# e TypeScript herda de uma única classe.", "Both define contracts, but with different roles. An **interface** describes only *what*: a set of operations a type promises to offer, with no state or implementation (some languages allow default methods). An **abstract class** is an incomplete class: it can hold state, have concrete methods and leave some abstract for the children to complete. A class can implement many interfaces, but in Java, C# and TypeScript it inherits from a single class."]),
      table([["Aspecto", "Aspect"], ["Interface", "Interface"], ["Classe abstrata", "Abstract class"]],
        [["Estado (campos)", "State (fields)"], ["Não", "No"], ["Sim", "Yes"]],
        [["Implementação", "Implementation"], ["Normalmente nenhuma", "Usually none"], ["Parcial, com métodos concretos", "Partial, with concrete methods"]],
        [["Múltiplas por classe", "Multiple per class"], ["Sim", "Yes"], ["Não, só uma", "No, only one"]],
        [["Uso típico", "Typical use"], ["Papel ou capacidade (Comparable, Payable)", "Role or capability (Comparable, Payable)"], ["Esqueleto comum de uma família (Template Method)", "Common skeleton of a family (Template Method)"]],
      ),
      h(["Relacionamentos entre classes", "Relationships between classes"]),
      p(["Entender os relacionamentos é o que permite desenhar diagramas de classes e prever o impacto de mudanças. Do mais fraco ao mais forte:", "Understanding relationships is what lets you draw class diagrams and predict the impact of changes. From weakest to strongest:"]),
      table([["Relacionamento", "Relationship"], ["Significado", "Meaning"], ["Exemplo", "Example"]],
        [["Dependência", "Dependency"], ["Uma classe usa outra de passagem (parâmetro, variável local)", "One class uses another in passing (parameter, local variable)"], ["`OrderService` usa `Logger` dentro de um método", "`OrderService` uses `Logger` inside a method"]],
        [["Associação", "Association"], ["Um objeto conhece outro durante um tempo mais longo, guardando uma referência", "An object knows another for a longer time, holding a reference"], ["`Teacher` conhece seus `Student`s", "`Teacher` knows their `Student`s"]],
        [["Agregação", "Aggregation"], ["Todo e parte, mas a parte vive sem o todo", "Whole and part, but the part lives without the whole"], ["`Team` agrega `Player`s; se o time acaba, os jogadores continuam", "`Team` aggregates `Player`s; if the team ends, players remain"]],
        [["Composição", "Composition"], ["Todo e parte, e a parte morre com o todo", "Whole and part, and the part dies with the whole"], ["`House` compõe `Room`s; sem a casa, os cômodos deixam de existir", "`House` composes `Room`s; without the house, rooms cease to exist"]],
        [["Herança / realização", "Inheritance / realization"], ["Especialização (é um) ou implementação de uma interface", "Specialization (is-a) or implementation of an interface"], ["`Circle` é um `Shape`; `Card` implementa `Payable`", "`Circle` is a `Shape`; `Card` implements `Payable`"]],
      ),
      code(`class Engine {}
class Car {
  private engine = new Engine();            // composition: created and owned by Car
  constructor(private driver?: Driver) {}   // association: reference kept
  refuel(station: Station) { station.pump(this); }   // dependency: parameter only
}
class Team { constructor(private players: Player[]) {} }  // aggregation: players come from outside`),
      h(["Boas práticas de POO", "OOP best practices"]),
      ul(
        ["**Diga, não pergunte** (*tell, don't ask*): peça ao objeto que faça a operação em vez de extrair seus dados para decidir fora.", "**Tell, don't ask**: ask the object to perform the operation instead of pulling its data out to decide outside."],
        ["**Prefira objetos imutáveis** quando possível: valores como `Money` ou `Email` que não mudam após criados evitam uma classe inteira de bugs.", "**Prefer immutable objects** when possible: values such as `Money` or `Email` that never change after creation avoid a whole class of bugs."],
        ["**Valide no construtor**: um objeto inválido nunca deveria existir.", "**Validate in the constructor**: an invalid object should never exist."],
        ["**Mantenha hierarquias rasas**: dois ou três níveis de herança já são muito.", "**Keep hierarchies shallow**: two or three inheritance levels are already a lot."],
        ["**Dependa de interfaces**, não de classes concretas, nas fronteiras entre módulos.", "**Depend on interfaces**, not concrete classes, at the boundaries between modules."],
      ),
      h(["Vantagens e desvantagens", "Advantages and disadvantages"]),
      p(["Entre as vantagens estão a organização por conceitos do domínio, o reuso por composição, a facilidade de testar objetos isolados com dobles e a proteção de invariantes pelo encapsulamento. Entre as desvantagens, estão o excesso de cerimônia (muitas classes pequenas), o risco de hierarquias profundas e frágeis, a tentação de modelar tudo como objeto mesmo quando uma função pura seria mais simples e o estado mutável compartilhado, que dificulta a concorrência. Muitos times modernos misturam POO nas fronteiras do domínio com funções puras e dados imutáveis no miolo dos cálculos.", "Advantages include organization by domain concepts, reuse through composition, ease of testing isolated objects with doubles and invariant protection through encapsulation. Disadvantages include excess ceremony (many small classes), the risk of deep and fragile hierarchies, the temptation to model everything as an object even when a pure function would be simpler, and shared mutable state, which makes concurrency harder. Many modern teams mix OOP at the domain boundaries with pure functions and immutable data in the core of calculations."]),
      h(["Resumo", "Summary"]),
      ul(
        ["Classe é a planta, objeto é a instância; o objeto reúne estado e comportamento.", "A class is the blueprint, an object is the instance; the object gathers state and behavior."],
        ["Os quatro pilares: encapsulamento, abstração, herança e polimorfismo.", "The four pillars: encapsulation, abstraction, inheritance and polymorphism."],
        ["Prefira composição a herança; use herança só para substituição genuína.", "Prefer composition to inheritance; use inheritance only for genuine substitution."],
        ["Interface descreve um contrato; classe abstrata fornece um esqueleto parcial com estado.", "An interface describes a contract; an abstract class provides a partial skeleton with state."],
        ["Relacionamentos, do mais fraco ao mais forte: dependência, associação, agregação, composição e herança.", "Relationships, weakest to strongest: dependency, association, aggregation, composition and inheritance."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Getters e setters violam o encapsulamento?** Quando expõem tudo sem regra, sim, na prática. Métodos com significado de negócio protegem melhor as invariantes.", "**Do getters and setters break encapsulation?** When they expose everything with no rule, in practice yes. Methods with business meaning protect invariants better."],
        ["**Qual a diferença entre agregação e composição?** O ciclo de vida. Na composição a parte não existe sem o todo; na agregação existe.", "**What is the difference between aggregation and composition?** The lifecycle. In composition the part does not exist without the whole; in aggregation it does."],
        ["**Herança múltipla é proibida?** Depende da linguagem: C++ e Python permitem; Java, C# e TypeScript permitem só uma superclasse, mas várias interfaces.", "**Is multiple inheritance forbidden?** It depends on the language: C++ and Python allow it; Java, C# and TypeScript allow one superclass but many interfaces."],
        ["**POO é melhor que programação funcional?** Não há vencedora; são ferramentas complementares, e boas bases de código usam ideias das duas.", "**Is OOP better than functional programming?** There is no winner; they are complementary tools, and good codebases use ideas from both."],
      ),
      tip(["Ao duvidar entre herança e composição, pergunte: *a subclasse pode ser usada em qualquer lugar onde a superclasse é usada, sem surpresas?* Se não, componha.", "When in doubt between inheritance and composition, ask: *can the subclass be used anywhere the superclass is used, without surprises?* If not, compose."]),
    ] },
  { id: "modularidade-e-interfaces", section: "lld", level: 1, icon: "extension", minutes: 11,
    title: ["Modularidade e interfaces", "Modularity and interfaces"],
    summary: ["Coesão, acoplamento, contratos, injeção de dependências, camadas e ports and adapters.", "Cohesion, coupling, contracts, dependency injection, layers and ports and adapters."],
    body: [
      p(["Um sistema grande só é compreensível quando pode ser dividido em partes que se entendem isoladamente. Essa divisão se chama **modularidade**: cada módulo (pacote, biblioteca, classe ou serviço) esconde suas decisões internas e oferece uma superfície pequena e estável para o resto do código. O conceito vem de um artigo clássico de David Parnas, de 1972, que propôs dividir o sistema escondendo, em cada módulo, a decisão de projeto mais provável de mudar. Duas medidas descrevem se a divisão é boa: **coesão** (o que está dentro do módulo) e **acoplamento** (o que o liga ao resto).", "A large system is only understandable when it can be split into parts that are understood in isolation. This split is called **modularity**: each module (package, library, class or service) hides its internal decisions and offers a small, stable surface to the rest of the code. The concept comes from a classic 1972 paper by David Parnas, which proposed dividing the system by hiding, in each module, the design decision most likely to change. Two measures describe whether the split is good: **cohesion** (what is inside the module) and **coupling** (what ties it to the rest)."]),
      h(["Coesão e acoplamento", "Cohesion and coupling"]),
      p(["**Coesão** mede o quanto os elementos de um módulo pertencem juntos. Alta coesão significa que tudo ali trabalha pelo mesmo propósito: uma classe `InvoiceCalculator` que só calcula valores de fatura. Baixa coesão é a classe `Utils` com envio de e-mail, formatação de datas e acesso a banco. **Acoplamento** mede o quanto um módulo depende de outros. Acoplamento alto faz uma mudança se espalhar; acoplamento baixo a contém. O objetivo clássico é **alta coesão e baixo acoplamento**.", "**Cohesion** measures how much the elements of a module belong together. High cohesion means everything there works toward the same purpose: an `InvoiceCalculator` class that only computes invoice amounts. Low cohesion is the `Utils` class with email sending, date formatting and database access. **Coupling** measures how much a module depends on others. High coupling makes a change spread; low coupling contains it. The classic goal is **high cohesion and low coupling**."]),
      table([["Tipo de acoplamento (do pior ao melhor)", "Coupling type (worst to best)"], ["O que acontece", "What happens"], ["Exemplo", "Example"]],
        [["De conteúdo", "Content"], ["Um módulo altera ou lê os internos de outro", "One module changes or reads another's internals"], ["Acessar campos privados via reflexão ou mexer em estado global do vizinho", "Reaching private fields via reflection or editing a neighbor's global state"]],
        [["Comum", "Common"], ["Módulos compartilham dados globais", "Modules share global data"], ["Duas classes lendo e gravando a mesma variável global", "Two classes reading and writing the same global variable"]],
        [["De controle", "Control"], ["Um módulo passa uma flag que dita o fluxo do outro", "One module passes a flag that dictates the other's flow"], ["`print(doc, true)` em que `true` muda o comportamento inteiro", "`print(doc, true)` where `true` changes the whole behavior"]],
        [["De dados", "Data"], ["Só trocam os dados de que precisam", "They only exchange the data they need"], ["`total(items)` recebe a lista e devolve um número", "`total(items)` receives the list and returns a number"]],
        [["Por mensagem / interface", "Message / interface"], ["Conhecem apenas um contrato abstrato", "They only know an abstract contract"], ["Serviço chama `PaymentGateway`, sem saber qual provedor", "Service calls `PaymentGateway`, not knowing which provider"]],
      ),
      p(["Sinais de baixa coesão: nomes genéricos (Manager, Helper), métodos que não usam os campos da classe e dificuldade em dar um nome curto ao módulo. Sinais de acoplamento alto: mudanças que atravessam vários módulos (conhecidas como *shotgun surgery*), testes que precisam montar metade do sistema e importações circulares. Há também o **acoplamento temporal**, em que é preciso chamar `init()` antes de `run()`; ele é invisível no tipo e uma fonte comum de erro, resolvido normalmente fazendo o construtor entregar um objeto já pronto para uso.", "Signs of low cohesion: generic names (Manager, Helper), methods that do not use the class's fields and difficulty giving the module a short name. Signs of high coupling: changes that cross several modules (known as *shotgun surgery*), tests that need half the system assembled and circular imports. There is also **temporal coupling**, where `init()` must be called before `run()`; it is invisible in the type and a common source of bugs, usually solved by having the constructor deliver an object already ready to use."]),
      h(["Interfaces e contratos", "Interfaces and contracts"]),
      p(["Uma **interface** é a fronteira de um módulo: lista o que ele promete e esconde como cumpre. Ela vale como um **contrato** quando, além das assinaturas, descreve **pré-condições** (o que o chamador deve garantir), **pós-condições** (o que o módulo garante em troca) e **invariantes** (o que sempre vale). É a ideia do *design by contract*: `withdraw(amount)` exige que amount seja positivo e que haja saldo; promete que o saldo diminuiu exatamente amount. Quem implementa a interface precisa honrar o contrato; quem chama pode confiar nele sem ler a implementação.", "An **interface** is a module's boundary: it lists what the module promises and hides how it delivers. It acts as a **contract** when, besides signatures, it describes **preconditions** (what the caller must guarantee), **postconditions** (what the module guarantees in return) and **invariants** (what always holds). This is the idea of *design by contract*: `withdraw(amount)` requires amount to be positive and the balance to suffice; it promises the balance decreased by exactly amount. Whoever implements the interface must honor the contract; whoever calls can trust it without reading the implementation."]),
      code(`/** Sends notifications. Contract: send() resolves only after the message is accepted
 *  for delivery; it rejects with NotifyError for invalid recipients. Never returns partial success. */
interface Notifier {
  send(to: string, message: string): Promise<void>;
}
class EmailNotifier implements Notifier {
  async send(to: string, message: string) { /* SMTP call */ }
}
class SmsNotifier implements Notifier {
  async send(to: string, message: string) { /* SMS provider call */ }
}
// Consumers know only Notifier:
async function notifyOverdue(n: Notifier, user: { contact: string }) {
  await n.send(user.contact, "Your invoice is overdue");
}`),
      p(["Boas interfaces são **pequenas** (poucos métodos, todos usados por todos os clientes), **estáveis** (mudam raramente), expressas na **linguagem do domínio** e sem vazar detalhes de implementação (uma interface `Repository` que devolve `ResultSet` do JDBC vaza o banco para o resto do código). Em TypeScript, a tipagem estrutural permite declarar a interface do lado de quem a consome: o módulo cliente define exatamente o que precisa e qualquer objeto compatível serve.", "Good interfaces are **small** (few methods, all used by all clients), **stable** (rarely changed), expressed in the **domain language** and not leaking implementation details (a `Repository` interface returning JDBC `ResultSet` leaks the database to the rest of the code). In TypeScript, structural typing lets you declare the interface on the consumer's side: the client module defines exactly what it needs and any compatible object will do."]),
      h(["Injeção de dependências e inversão de controle", "Dependency injection and inversion of control"]),
      p(["**Inversão de controle (IoC)** é um princípio geral em que o fluxo ou a criação das peças é conduzido por um agente externo, não pelo próprio código de negócio (o famoso *não nos chame, nós chamamos você*). **Injeção de dependências (DI)** é a forma mais comum de IoC: uma classe não cria suas dependências com `new`; ela as **recebe** de fora, geralmente no construtor. O ponto onde tudo é montado se chama **composition root**, normalmente o início do programa.", "**Inversion of control (IoC)** is a general principle in which the flow or the creation of parts is driven by an external agent, not by the business code itself (the famous *don't call us, we'll call you*). **Dependency injection (DI)** is the most common form of IoC: a class does not create its dependencies with `new`; it **receives** them from outside, usually in the constructor. The place where everything is wired is called the **composition root**, normally the start of the program."]),
      code(`// Without DI: hard-wired, impossible to test without a real SMTP server
class SignupBad {
  private mail = new SmtpMailer("smtp.example.com");
  run(email: string) { this.mail.send(email, "Welcome"); }
}

// With DI: depends on an abstraction, receives it from outside
interface Mailer { send(to: string, body: string): Promise<void> }
class Signup {
  constructor(private readonly mailer: Mailer) {}
  async run(email: string) { await this.mailer.send(email, "Welcome"); }
}

// Production composition root
const signup = new Signup(new SmtpMailer("smtp.example.com"));
// Test: a fake that records messages
class FakeMailer implements Mailer { sent: string[] = []; async send(to: string) { this.sent.push(to); } }
const fake = new FakeMailer();
await new Signup(fake).run("a@b.com");   // fake.sent === ["a@b.com"]`),
      table([["Forma de injeção", "Injection style"], ["Como funciona", "How it works"], ["Quando usar", "When to use"]],
        [["Por construtor", "Constructor"], ["Dependências obrigatórias chegam ao criar o objeto", "Required dependencies arrive when creating the object"], ["Padrão recomendado: o objeto nasce completo e imutável", "Recommended default: the object is born complete and immutable"]],
        [["Por método (setter)", "Setter"], ["A dependência é atribuída depois", "The dependency is assigned later"], ["Dependências opcionais; cuidado com objetos meio configurados", "Optional dependencies; beware half-configured objects"]],
        [["Por parâmetro", "Parameter"], ["Passada só na chamada do método", "Passed only at method call"], ["Quando a dependência varia a cada operação", "When the dependency varies per operation"]],
        [["Service locator", "Service locator"], ["A classe pede a dependência a um registro global", "The class asks a global registry for the dependency"], ["Geralmente evitar: esconde as dependências e dificulta testes", "Usually avoid: hides dependencies and makes tests harder"]],
      ),
      p(["Contêineres de DI (Spring, .NET, NestJS, Guice, Dagger) automatizam a montagem, mas DI não depende deles: passar objetos no construtor à mão já é DI, e em muitos projetos pequenos é suficiente.", "DI containers (Spring, .NET, NestJS, Guice, Dagger) automate the wiring, but DI does not depend on them: passing objects through the constructor by hand is already DI, and in many small projects it is enough."]),
      h(["Camadas", "Layers"]),
      p(["Uma forma tradicional de modularizar é separar o sistema em **camadas**, cada uma com uma responsabilidade, em que a camada de cima só conhece a de baixo. A arquitetura clássica em três camadas separa apresentação, regras de negócio e acesso a dados.", "A traditional way to modularize is to split the system into **layers**, each with one responsibility, where an upper layer only knows the one below. The classic three-tier architecture separates presentation, business rules and data access."]),
      fig(["Arquitetura em camadas: dependências apontam para baixo", "Layered architecture: dependencies point downward"], [
        [node("ui", ["Apresentação (controllers)", "Presentation (controllers)"], "client")],
        [node("app", ["Aplicação (casos de uso)", "Application (use cases)"], "service")],
        [node("dom", ["Domínio (regras)", "Domain (rules)"], "service")],
        [node("infra", ["Infraestrutura (banco, filas)", "Infrastructure (DB, queues)"], "data")],
      ], [edge("ui", "app"), edge("app", "dom"), edge("app", "infra"), edge("dom", "infra", ["depende", "depends"], { dashed: true })]),
      p(["O risco do modelo clássico é o domínio depender da infraestrutura: as regras de negócio importam classes de banco e ficam presas a ele. A arquitetura moderna corrige isso invertendo essa dependência, como mostra a próxima seção.", "The risk of the classic model is the domain depending on infrastructure: business rules import database classes and get stuck to it. Modern architecture fixes this by inverting that dependency, as the next section shows."]),
      h(["Ports and Adapters (arquitetura hexagonal)", "Ports and Adapters (hexagonal architecture)"]),
      p(["Proposta por Alistair Cockburn, a arquitetura **hexagonal** coloca o domínio no centro e o isola do mundo externo por **portas** (*ports*): interfaces definidas pelo próprio domínio. Os **adaptadores** (*adapters*) ficam na borda e traduzem entre a porta e uma tecnologia concreta: um controller HTTP, um consumidor de fila, um repositório SQL, um cliente de um provedor de pagamento. Há portas de **entrada** (*driving*, que chamam a aplicação) e de **saída** (*driven*, que a aplicação chama). Note a inversão: o domínio define `OrderRepository`, e o adaptador SQL, que está fora, o implementa. A seta de código aponta para dentro, em direção ao domínio.", "Proposed by Alistair Cockburn, **hexagonal** architecture places the domain at the center and isolates it from the outside world through **ports**: interfaces defined by the domain itself. **Adapters** sit at the edge and translate between the port and a concrete technology: an HTTP controller, a queue consumer, a SQL repository, a client for a payment provider. There are **inbound** ports (*driving*, which call the application) and **outbound** ports (*driven*, which the application calls). Note the inversion: the domain defines `OrderRepository`, and the SQL adapter, which lives outside, implements it. The code arrow points inward, toward the domain."]),
      fig(["Ports and adapters: o domínio define as portas", "Ports and adapters: the domain defines the ports"], [
        [node("http", ["Adapter HTTP", "HTTP adapter"], "client"), node("cli", ["Adapter CLI / fila", "CLI / queue adapter"], "client")],
        [node("pin", ["Porta de entrada", "Inbound port"], "edge")],
        [node("core", ["Domínio + casos de uso", "Domain + use cases"], "service")],
        [node("pout", ["Porta de saída", "Outbound port"], "edge")],
        [node("sql", ["Adapter SQL", "SQL adapter"], "data"), node("pay", ["Adapter pagamentos", "Payments adapter"], "ext")],
      ], [edge("http", "pin"), edge("cli", "pin"), edge("pin", "core"), edge("core", "pout"), edge("sql", "pout", ["implementa", "implements"], { dashed: true }), edge("pay", "pout", ["implementa", "implements"], { dashed: true })]),
      code(`// Domain defines the outbound port
export interface OrderRepository {
  save(order: Order): Promise<void>;
  byId(id: string): Promise<Order | undefined>;
}
// Use case depends only on the port
export class PlaceOrder {
  constructor(private repo: OrderRepository, private payments: PaymentGateway) {}
  async execute(cmd: { orderId: string; cardToken: string }) {
    const order = await this.repo.byId(cmd.orderId);
    if (!order) throw new Error("order not found");
    await this.payments.charge(cmd.cardToken, order.total());
    order.markPaid();
    await this.repo.save(order);
  }
}
// Adapter lives at the edge and can be swapped (Postgres, in-memory for tests)
export class PostgresOrderRepository implements OrderRepository { /* SQL here */ }
export class InMemoryOrderRepository implements OrderRepository { /* Map here */ }`),
      p(["O ganho é prático: os casos de uso rodam em testes rápidos com adaptadores em memória, e trocar o banco ou o provedor de pagamento significa escrever um novo adaptador sem tocar nas regras. O preço é mais arquivos e mapeamentos entre modelos, que só compensa quando o domínio tem regras relevantes. Em um CRUD simples, é cerimônia desnecessária.", "The gain is practical: use cases run in fast tests with in-memory adapters, and swapping the database or payment provider means writing a new adapter without touching the rules. The price is more files and mappings between models, which only pays off when the domain has relevant rules. In a simple CRUD it is unnecessary ceremony."]),
      h(["Estruturando módulos em projetos reais", "Structuring modules in real projects"]),
      ul(
        ["**Organize por funcionalidade, não por tipo técnico**: uma pasta `billing` com tudo de cobrança tende a ter mais coesão que pastas globais `controllers`, `services` e `models`.", "**Organize by feature, not by technical type**: a `billing` folder with everything about charging tends to have more cohesion than global `controllers`, `services` and `models` folders."],
        ["**Exponha uma API pública pequena** por módulo (um arquivo `index` que reexporta só o necessário) e trate o resto como privado.", "**Expose a small public API** per module (an `index` file re-exporting only what is needed) and treat the rest as private."],
        ["**Evite dependências circulares**: se A importa B e B importa A, falta uma abstração ou os módulos são um só.", "**Avoid circular dependencies**: if A imports B and B imports A, an abstraction is missing or the modules are really one."],
        ["**Dependa na direção da estabilidade**: módulos instáveis dependem dos estáveis, não o contrário. Regras de negócio são mais estáveis que frameworks.", "**Depend in the direction of stability**: unstable modules depend on stable ones, not the reverse. Business rules are more stable than frameworks."],
        ["**Monolito modular antes de microsserviços**: fronteiras claras dentro de um só deploy permitem separar serviços depois, se for preciso.", "**A modular monolith before microservices**: clear boundaries inside one deployment allow splitting services later, if needed."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Criar uma interface para cada classe por reflexo, sem segunda implementação nem necessidade de teste: apenas dobra a quantidade de arquivos.", "Creating an interface for every class by reflex, with no second implementation or testing need: it just doubles the number of files."],
        ["Usar um contêiner de DI como service locator, pedindo dependências em qualquer lugar.", "Using a DI container as a service locator, requesting dependencies anywhere."],
        ["Vazar tipos de infraestrutura (entidades de ORM, DTOs de HTTP) para dentro do domínio.", "Leaking infrastructure types (ORM entities, HTTP DTOs) into the domain."],
        ["Fazer camadas pass-through, que só repassam a chamada e não agregam responsabilidade.", "Building pass-through layers that only forward the call and add no responsibility."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Modularidade é dividir o sistema escondendo decisões em módulos com superfície pequena.", "Modularity is splitting the system by hiding decisions in modules with a small surface."],
        ["Busque alta coesão e baixo acoplamento; prefira depender de interfaces.", "Aim for high cohesion and low coupling; prefer depending on interfaces."],
        ["Um contrato descreve pré-condições, pós-condições e invariantes.", "A contract describes preconditions, postconditions and invariants."],
        ["DI entrega as dependências de fora; o composition root monta o sistema.", "DI delivers dependencies from outside; the composition root wires the system."],
        ["Ports and adapters inverte a dependência: o domínio define as portas e a infraestrutura as implementa.", "Ports and adapters inverts the dependency: the domain defines the ports and infrastructure implements them."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**DI e IoC são a mesma coisa?** Não. IoC é o princípio amplo; DI é uma técnica específica para aplicá-lo à criação de dependências.", "**Are DI and IoC the same thing?** No. IoC is the broad principle; DI is a specific technique to apply it to dependency creation."],
        ["**Preciso de um framework para fazer DI?** Não. Passar dependências pelo construtor já é DI.", "**Do I need a framework for DI?** No. Passing dependencies through the constructor is already DI."],
        ["**Arquitetura hexagonal é o mesmo que limpa ou cebola?** São variações da mesma ideia: domínio no centro e dependências apontando para dentro.", "**Is hexagonal the same as clean or onion architecture?** They are variations of the same idea: domain at the center and dependencies pointing inward."],
        ["**Quanto acoplamento é aceitável?** Algum é inevitável. O alvo é acoplar a coisas estáveis e abstratas, e não a detalhes que mudam.", "**How much coupling is acceptable?** Some is unavoidable. The aim is to couple to stable, abstract things, not to details that change."],
      ),
      tip(["Teste prático de fronteira: consegue rodar a regra de negócio principal em um teste de unidade sem banco, rede ou framework? Se sim, sua modularidade está funcionando.", "A practical boundary test: can you run the main business rule in a unit test without a database, network or framework? If so, your modularity is working."]),
    ] },
  { id: "principios-solid", section: "lld", level: 1, icon: "rule", minutes: 14,
    title: ["Princípios SOLID", "SOLID principles"],
    summary: ["Os cinco princípios de design orientado a objetos, cada um com violação, correção, diagrama e código.", "The five object-oriented design principles, each with a violation, a fix, a diagram and code."],
    body: [
      p(["**SOLID** é um acrônimo para cinco princípios de design orientado a objetos reunidos por Robert C. Martin (o *Uncle Bob*) no início dos anos 2000: **S**ingle Responsibility, **O**pen/Closed, **L**iskov Substitution, **I**nterface Segregation e **D**ependency Inversion. Eles não são leis, e sim heurísticas que descrevem como o código costuma se comportar quando o design é bom: mudanças ficam localizadas, extensões não exigem reescrita e as peças podem ser testadas e trocadas isoladamente. Cada princípio ataca um tipo de dor que aparece quando o sistema cresce.", "**SOLID** is an acronym for five object-oriented design principles gathered by Robert C. Martin (*Uncle Bob*) in the early 2000s: **S**ingle Responsibility, **O**pen/Closed, **L**iskov Substitution, **I**nterface Segregation and **D**ependency Inversion. They are not laws, but heuristics describing how code tends to behave when the design is good: changes stay localized, extensions do not require rewrites and parts can be tested and swapped in isolation. Each principle attacks a kind of pain that appears as the system grows."]),
      table([["Princípio", "Principle"], ["Em uma frase", "In one sentence"], ["Dor que evita", "Pain it avoids"]],
        [["S: Responsabilidade Única", "S: Single Responsibility"], ["Uma classe deve ter um único motivo para mudar", "A class should have a single reason to change"], ["Mudar o e-mail quebra o cálculo do imposto", "Changing the email breaks the tax calculation"]],
        [["O: Aberto/Fechado", "O: Open/Closed"], ["Aberto para extensão, fechado para modificação", "Open for extension, closed for modification"], ["Cada novo tipo exige editar um `switch` em dez lugares", "Each new type requires editing a `switch` in ten places"]],
        [["L: Substituição de Liskov", "L: Liskov Substitution"], ["Subtipos devem poder substituir seus tipos base sem quebrar o programa", "Subtypes must be substitutable for their base types without breaking the program"], ["Uma subclasse que lança exceção onde a base não lançava", "A subclass that throws where the base did not"]],
        [["I: Segregação de Interfaces", "I: Interface Segregation"], ["Clientes não devem depender de métodos que não usam", "Clients should not depend on methods they do not use"], ["Implementar métodos vazios só para satisfazer uma interface gorda", "Implementing empty methods just to satisfy a fat interface"]],
        [["D: Inversão de Dependência", "D: Dependency Inversion"], ["Dependa de abstrações, não de implementações concretas", "Depend on abstractions, not on concrete implementations"], ["Regra de negócio presa a um banco ou provedor específico", "Business rule stuck to a specific database or provider"]],
      ),
      h(["S: Princípio da Responsabilidade Única (SRP)", "S: Single Responsibility Principle (SRP)"]),
      p(["O enunciado de Martin é que uma classe deve ter **um, e somente um, motivo para mudar**. A palavra importante é *motivo*: não significa fazer uma única coisa, e sim atender a um único ator ou área de interesse. Se o departamento financeiro e o de TI podem pedir mudanças diferentes na mesma classe, ela tem duas responsabilidades. Uma classe `Employee` que calcula o salário (financeiro), gera o relatório (RH) e salva no banco (infraestrutura) muda por três razões e cada mudança arrisca quebrar as outras.", "Martin's statement is that a class should have **one, and only one, reason to change**. The important word is *reason*: it does not mean doing one single thing, but serving a single actor or area of concern. If finance and IT may request different changes to the same class, it has two responsibilities. An `Employee` class that computes pay (finance), generates the report (HR) and saves to the database (infrastructure) changes for three reasons and each change risks breaking the others."]),
      code(`// VIOLATION: three reasons to change in one class
class EmployeeBad {
  constructor(public name: string, public hours: number, public rate: number) {}
  calculatePay() { return this.hours * this.rate; }                    // finance
  report() { return this.name + ": " + this.calculatePay().toFixed(2); } // HR / presentation
  save() { /* INSERT INTO employees ... */ }                          // persistence
}

// FIX: separate by reason to change
class Employee { constructor(readonly name: string, readonly hours: number, readonly rate: number) {} }
class PayCalculator { pay(e: Employee) { return e.hours * e.rate; } }
class EmployeeReport {
  constructor(private calc: PayCalculator) {}
  render(e: Employee) { return e.name + ": " + this.calc.pay(e).toFixed(2); }
}
class EmployeeRepository { save(e: Employee): void { /* SQL */ } }`),
      p(["Cuidado com o exagero: dividir em classes de uma linha cada gera um quebra-cabeça. O bom critério é observar o que muda junto. Se duas coisas sempre mudam pelo mesmo motivo, mantenha-as juntas.", "Beware of excess: splitting into one-line classes creates a puzzle. The good criterion is to watch what changes together. If two things always change for the same reason, keep them together."]),
      h(["O: Princípio Aberto/Fechado (OCP)", "O: Open/Closed Principle (OCP)"]),
      p(["Formulado por Bertrand Meyer e popularizado por Martin, diz que as entidades de software devem estar **abertas para extensão, mas fechadas para modificação**. Adicionar um comportamento novo deve ser feito escrevendo código novo, e não editando código já testado e em produção. A técnica típica é introduzir uma abstração (interface) no ponto de variação e implementar cada variante em uma classe própria, trocando um `switch` por polimorfismo.", "Formulated by Bertrand Meyer and popularized by Martin, it says software entities should be **open for extension but closed for modification**. Adding new behavior should be done by writing new code, not by editing code already tested and in production. The typical technique is to introduce an abstraction (interface) at the variation point and implement each variant in its own class, replacing a `switch` with polymorphism."]),
      code(`// VIOLATION: every new discount type edits this function
function discountBad(kind: string, total: number): number {
  switch (kind) {
    case "none": return 0;
    case "member": return total * 0.1;
    case "blackfriday": return total * 0.3;   // new case = edit + retest everything
    default: throw new Error("unknown");
  }
}

// FIX: extend by adding classes
interface Discount { amount(total: number): number }
class NoDiscount implements Discount { amount() { return 0; } }
class MemberDiscount implements Discount { amount(t: number) { return t * 0.1; } }
class BlackFridayDiscount implements Discount { amount(t: number) { return t * 0.3; } }   // new file only

class Checkout {
  constructor(private discount: Discount) {}
  total(subtotal: number) { return subtotal - this.discount.amount(subtotal); }
}`),
      fig(["OCP: Checkout fechado, descontos abertos", "OCP: Checkout closed, discounts open"], [
        [node("co", "Checkout", "service")],
        [node("di", ["«interface» Discount", "«interface» Discount"], "edge")],
        [node("d1", "NoDiscount", "data"), node("d2", "MemberDiscount", "data"), node("d3", "BlackFridayDiscount", "data")],
      ], [edge("co", "di", ["usa", "uses"]), edge("d1", "di", "", { dashed: true }), edge("d2", "di", "", { dashed: true }), edge("d3", "di", "", { dashed: true })]),
      p(["Observação importante: fechamento total é impossível. Escolha as variações **que realmente costumam mudar** (formas de desconto, de pagamento, de frete) e feche o código contra elas. Abstrair tudo antes de saber o que muda gera interfaces inúteis. Uma boa prática é aplicar a abstração na segunda ou terceira vez que a mesma mudança aparece.", "Important note: total closure is impossible. Choose the variations **that really tend to change** (discount, payment and shipping types) and close the code against them. Abstracting everything before knowing what changes produces useless interfaces. A good practice is to apply the abstraction the second or third time the same change shows up."]),
      h(["L: Princípio da Substituição de Liskov (LSP)", "L: Liskov Substitution Principle (LSP)"]),
      p(["Barbara Liskov formulou que, se `S` é subtipo de `T`, objetos de `T` podem ser substituídos por objetos de `S` **sem alterar a correção do programa**. Em termos de contrato: a subclasse não pode exigir *mais* (pré-condições mais fortes), prometer *menos* (pós-condições mais fracas) nem quebrar invariantes da base. O exemplo clássico é o retângulo e o quadrado: em matemática o quadrado é um retângulo, mas se `Square` herda de `Rectangle` e altera os dois lados quando se muda a largura, o código que assume que largura e altura são independentes se comporta mal.", "Barbara Liskov formulated that if `S` is a subtype of `T`, objects of `T` can be replaced by objects of `S` **without changing the correctness of the program**. In contract terms: the subclass cannot demand *more* (stronger preconditions), promise *less* (weaker postconditions) or break the base's invariants. The classic example is the rectangle and the square: in mathematics a square is a rectangle, but if `Square` inherits from `Rectangle` and changes both sides when the width changes, code that assumes width and height are independent misbehaves."]),
      code(`// VIOLATION
class Rectangle {
  constructor(public w: number, public h: number) {}
  setWidth(w: number) { this.w = w; }
  setHeight(h: number) { this.h = h; }
  area() { return this.w * this.h; }
}
class Square extends Rectangle {
  setWidth(w: number) { this.w = w; this.h = w; }    // surprises callers
  setHeight(h: number) { this.w = h; this.h = h; }
}
function stretch(r: Rectangle) { r.setWidth(5); r.setHeight(2); return r.area(); }  // expects 10
stretch(new Square(1, 1));                            // returns 4: broken substitution

// FIX: no false is-a. Model the shared idea and keep immutability
interface Shape { area(): number }
class Rect implements Shape { constructor(readonly w: number, readonly h: number) {} area() { return this.w * this.h; } }
class Sq implements Shape { constructor(readonly side: number) {} area() { return this.side ** 2; } }`),
      p(["Outros sinais de violação do LSP: subclasse que lança `NotSupportedException` para um método herdado, que ignora silenciosamente uma chamada, ou código cliente que precisa de `instanceof` para tratar um subtipo diferente. A correção costuma ser reorganizar a hierarquia (extrair uma interface menor que todos cumprem de fato) ou trocar herança por composição. Um exemplo clássico é `Bird` com `fly()`: o pinguim é uma ave, mas não voa; modele `FlyingBird` à parte ou use um comportamento composto.", "Other signs of LSP violation: a subclass that throws `NotSupportedException` for an inherited method, silently ignores a call, or client code that needs `instanceof` to handle a different subtype. The fix is usually to reorganize the hierarchy (extract a smaller interface that all truly fulfill) or replace inheritance with composition. A classic example is `Bird` with `fly()`: the penguin is a bird but does not fly; model `FlyingBird` separately or use a composed behavior."]),
      h(["I: Princípio da Segregação de Interfaces (ISP)", "I: Interface Segregation Principle (ISP)"]),
      p(["Nenhum cliente deve ser obrigado a depender de métodos que não usa. Interfaces grandes (*gordas*) forçam implementações a fornecer métodos sem sentido e fazem os clientes recompilarem ou quebrarem quando algo que não os interessa muda. A solução é dividir a interface em papéis menores e coesos, de modo que cada cliente enxergue só o que precisa. Uma classe pode implementar vários papéis.", "No client should be forced to depend on methods it does not use. Large (*fat*) interfaces force implementations to provide meaningless methods and make clients recompile or break when something they do not care about changes. The solution is to split the interface into smaller cohesive roles, so each client sees only what it needs. A class may implement several roles."]),
      code(`// VIOLATION: a fat interface
interface Machine { print(d: Doc): void; scan(): Doc; fax(d: Doc): void }
class SimplePrinter implements Machine {
  print(d: Doc) { /* ok */ }
  scan(): Doc { throw new Error("not supported"); }   // forced to lie
  fax(d: Doc) { throw new Error("not supported"); }
}

// FIX: role interfaces
interface Printer { print(d: Doc): void }
interface Scanner { scan(): Doc }
interface Fax { fax(d: Doc): void }
class SimplePrinter2 implements Printer { print(d: Doc) { /* ok */ } }
class OfficeMachine implements Printer, Scanner, Fax {
  print(d: Doc) {} scan(): Doc { return {} as Doc; } fax(d: Doc) {}
}
function printReport(p: Printer, d: Doc) { p.print(d); }   // asks only for what it uses`),
      p(["O ISP anda de mãos dadas com o LSP: interfaces menores são mais fáceis de implementar fielmente. Em linguagens com tipagem estrutural (TypeScript, Go), o consumidor declara a interface mínima de que precisa e qualquer tipo compatível a satisfaz, tornando a segregação quase natural. Em Go, a biblioteca padrão é exemplo: `io.Reader` tem um único método.", "ISP goes hand in hand with LSP: smaller interfaces are easier to implement faithfully. In languages with structural typing (TypeScript, Go) the consumer declares the minimal interface it needs and any compatible type satisfies it, making segregation almost natural. In Go the standard library is the example: `io.Reader` has a single method."]),
      h(["D: Princípio da Inversão de Dependência (DIP)", "D: Dependency Inversion Principle (DIP)"]),
      p(["O DIP tem duas partes: módulos de **alto nível** não devem depender de módulos de **baixo nível**, ambos devem depender de **abstrações**; e as abstrações não devem depender de detalhes, os detalhes é que dependem das abstrações. Sem o princípio, a regra de negócio (alto nível) importa a classe do banco de dados (baixo nível): trocar o banco ou testar a regra sem ele fica impossível. Com o princípio, a regra define a interface de que precisa, e o banco a implementa. A dependência de código se inverte, apontando para a regra.", "DIP has two parts: **high-level** modules should not depend on **low-level** modules, both should depend on **abstractions**; and abstractions should not depend on details, details should depend on abstractions. Without the principle, the business rule (high level) imports the database class (low level): swapping the database or testing the rule without it becomes impossible. With the principle, the rule defines the interface it needs and the database implements it. The code dependency inverts, pointing to the rule."]),
      fig(["DIP: antes e depois (a seta mostra quem importa quem)", "DIP: before and after (the arrow shows who imports whom)"], [
        [node("hi", ["Regra de negócio", "Business rule"], "service")],
        [node("ab", ["«interface» Repository", "«interface» Repository"], "edge")],
        [node("lo", ["Adapter MySQL", "MySQL adapter"], "data"), node("lo2", ["Adapter em memória", "In-memory adapter"], "data")],
      ], [edge("hi", "ab", ["depende de", "depends on"]), edge("lo", "ab", ["implementa", "implements"], { dashed: true }), edge("lo2", "ab", ["implementa", "implements"], { dashed: true })]),
      code(`// VIOLATION: high level creates and knows the low level
class ReportServiceBad {
  private db = new MySqlDatabase();                  // concrete, hard-wired
  monthly() { return this.db.query("SELECT ..."); }
}

// FIX: abstraction owned by the high level, injected
interface SalesSource { totalsByMonth(): Promise<number[]> }
class ReportService {
  constructor(private sales: SalesSource) {}
  async monthly() { return (await this.sales.totalsByMonth()).map((t) => t.toFixed(2)); }
}
class MySqlSales implements SalesSource { async totalsByMonth() { /* SQL */ return []; } }
class FakeSales implements SalesSource { async totalsByMonth() { return [10, 20]; } }
// test: new ReportService(new FakeSales()).monthly()`),
      p(["**DIP não é o mesmo que DI.** O princípio fala de para onde as dependências apontam; a injeção de dependências é uma técnica para entregar a implementação a quem depende da abstração. Dá para praticar DIP sem contêiner algum.", "**DIP is not the same as DI.** The principle is about which way dependencies point; dependency injection is a technique to hand the implementation to whoever depends on the abstraction. You can practice DIP without any container."]),
      h(["Como os cinco se reforçam", "How the five reinforce each other"]),
      p(["Os princípios não são independentes. O SRP gera classes pequenas que são fáceis de abstrair; o OCP exige abstrações, e o LSP garante que elas sejam confiáveis; o ISP mantém essas abstrações enxutas; e o DIP define quem é o dono delas. Um design que viola um deles normalmente pressiona os outros: uma interface gorda (ISP) leva a implementações vazias (LSP) e a clientes acoplados a detalhes (DIP).", "The principles are not independent. SRP generates small classes that are easy to abstract; OCP demands abstractions and LSP guarantees they are trustworthy; ISP keeps those abstractions lean; and DIP defines who owns them. A design that violates one usually puts pressure on the others: a fat interface (ISP) leads to empty implementations (LSP) and clients coupled to details (DIP)."]),
      h(["Críticas e uso com bom senso", "Criticism and using judgment"]),
      ul(
        ["**SOLID pode virar dogma.** Seguir à risca em um script de cem linhas gera interfaces e fábricas sem propósito. Use quando a dor existe ou é muito previsível.", "**SOLID can become dogma.** Following it to the letter in a hundred-line script generates purposeless interfaces and factories. Use it when the pain exists or is highly predictable."],
        ["**Foi pensado para orientação a objetos**, mas as ideias valem para módulos e funções (passar uma função como parâmetro é DIP em pequena escala).", "**It was conceived for object orientation**, but the ideas apply to modules and functions (passing a function as a parameter is DIP at small scale)."],
        ["**Há custo de indireção**: cada abstração é um salto a mais para quem lê. Peça a si mesmo qual mudança a abstração protege.", "**There is an indirection cost**: every abstraction is one more jump for the reader. Ask yourself which change the abstraction protects."],
        ["**O SRP é o mais mal compreendido**: não é uma classe por método. Pense em atores e razões de mudança.", "**SRP is the most misunderstood**: it is not one class per method. Think of actors and reasons for change."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["SRP: um motivo para mudar por classe, ligado a um único ator.", "SRP: one reason to change per class, tied to a single actor."],
        ["OCP: estenda adicionando código, em vez de editar; troque `switch` por polimorfismo nos pontos que variam.", "OCP: extend by adding code instead of editing; replace `switch` with polymorphism at the points that vary."],
        ["LSP: subtipos honram o contrato da base; sem exceções surpresa nem pré-condições mais fortes.", "LSP: subtypes honor the base contract; no surprise exceptions or stronger preconditions."],
        ["ISP: interfaces pequenas e específicas por papel.", "ISP: small interfaces specific to a role."],
        ["DIP: o alto nível define abstrações e o baixo nível as implementa.", "DIP: the high level defines abstractions and the low level implements them."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**SOLID serve para programação funcional?** Os princípios de fundo (separar razões de mudança, depender de abstrações) valem, só que expressos com funções e módulos.", "**Does SOLID apply to functional programming?** The underlying principles (separating reasons for change, depending on abstractions) hold, just expressed with functions and modules."],
        ["**Por onde começar em um código legado?** Pelo DIP e SRP: isole o acesso a banco e serviços externos atrás de interfaces para conseguir testar, e depois divida as classes grandes.", "**Where to start in legacy code?** With DIP and SRP: isolate database and external service access behind interfaces so you can test, then split the large classes."],
        ["**Como detectar violação do OCP?** Quando um requisito novo, do tipo mais comum do seu domínio, exige editar um `switch` ou `if` em vários arquivos.", "**How to spot an OCP violation?** When a new requirement, of your domain's most common kind, forces editing a `switch` or `if` in several files."],
        ["**Todo método sobrescrito viola o LSP?** Não: sobrescrever é normal. Viola quando muda o contrato esperado pelos clientes da base.", "**Does every overridden method violate LSP?** No: overriding is normal. It violates when it changes the contract expected by the base's clients."],
      ),
      tip(["Antes de aplicar qualquer princípio, nomeie a mudança que ele deve facilitar. Se você não consegue citar uma mudança provável, provavelmente ainda não precisa da abstração.", "Before applying any principle, name the change it should make easier. If you cannot cite a likely change, you probably do not need the abstraction yet."]),
    ] },
  { id: "dry-kiss-yagni", section: "lld", level: 0, icon: "balance", minutes: 10,
    title: ["DRY, KISS e YAGNI", "DRY, KISS and YAGNI"],
    summary: ["Três princípios de simplicidade, a Regra de Três, a Lei de Demeter e quando duplicar é melhor.", "Three simplicity principles, the Rule of Three, the Law of Demeter and when duplicating is better."],
    body: [
      p(["Além dos princípios formais como SOLID, existe um conjunto de regras práticas que orientam o dia a dia de quem escreve código. Três delas são tão citadas que viraram siglas: **DRY** (*Don't Repeat Yourself*), **KISS** (*Keep It Simple, Stupid*) e **YAGNI** (*You Aren't Gonna Need It*). Elas parecem óbvias, mas na prática puxam em direções diferentes: DRY empurra para abstrair, KISS e YAGNI empurram para não abstrair cedo demais. Saber balancear as três é uma das marcas de quem projeta bem.", "Beyond formal principles such as SOLID, there is a set of practical rules that guide the day-to-day of those who write code. Three of them are so often cited that they became acronyms: **DRY** (*Don't Repeat Yourself*), **KISS** (*Keep It Simple, Stupid*) and **YAGNI** (*You Aren't Gonna Need It*). They seem obvious, but in practice they pull in different directions: DRY pushes toward abstracting, KISS and YAGNI push against abstracting too early. Balancing the three is one of the marks of good design."]),
      fig(["As três regras e a tensão entre elas", "The three rules and the tension between them"], [
        [node("dry", "DRY", "service")],
        [node("rule3", ["Regra de Três", "Rule of Three"], "edge")],
        [node("kiss", "KISS", "service"), node("yagni", "YAGNI", "service")],
      ], [edge("dry", "rule3", ["abstrair já?", "abstract now?"]), edge("kiss", "rule3", ["esperar", "wait"]), edge("yagni", "rule3", ["esperar", "wait"])]),
      h(["DRY: não se repita", "DRY: don't repeat yourself"]),
      p(["A formulação original, de Andy Hunt e Dave Thomas em *The Pragmatic Programmer*, é: *todo conhecimento deve ter uma representação única, não ambígua e oficial dentro de um sistema*. Note que o princípio fala de **conhecimento**, não de linhas de texto parecidas. Se a regra *o desconto máximo é de 20%* aparece em três lugares, ao mudá-la para 25% você corre o risco de esquecer um e produzir um sistema inconsistente. Duplicação de conhecimento aparece também em documentação que repete o código, em esquemas de banco copiados à mão em classes e em validações do front-end e do back-end que divergem.", "The original formulation, by Andy Hunt and Dave Thomas in *The Pragmatic Programmer*, is: *every piece of knowledge must have a single, unambiguous, authoritative representation within a system*. Note that the principle is about **knowledge**, not similar-looking lines of text. If the rule *maximum discount is 20%* appears in three places, when you change it to 25% you risk forgetting one and producing an inconsistent system. Duplication of knowledge also shows up in documentation that repeats the code, in database schemas copied by hand into classes and in front-end and back-end validations that diverge."]),
      code(`// BEFORE: the same rule in three places
function priceForGuest(p: number)  { return p > 100 ? p * 0.8 : p; }   // 20% off above 100
function priceForMember(p: number) { return p > 100 ? p * 0.8 : p * 0.9; }
function invoiceTotal(p: number)   { return p > 100 ? p * 0.8 : p; }

// AFTER: the knowledge lives once
const MAX_DISCOUNT = 0.2;
const BULK_THRESHOLD = 100;
const bulkDiscount = (p: number) => (p > BULK_THRESHOLD ? p * (1 - MAX_DISCOUNT) : p);
const priceForGuest2 = bulkDiscount;
const priceForMember2 = (p: number) => (p > BULK_THRESHOLD ? bulkDiscount(p) : p * 0.9);
const invoiceTotal2 = bulkDiscount;`),
      p(["Técnicas para aplicar DRY: extrair funções e constantes, criar classes para conceitos repetidos, gerar código a partir de uma única fonte (por exemplo, tipos de cliente gerados a partir de um esquema OpenAPI) e usar herança ou composição para compartilhar comportamento. A armadilha é a **abstração prematura**, tema da seção seguinte.", "Techniques to apply DRY: extracting functions and constants, creating classes for repeated concepts, generating code from a single source (for example, client types generated from an OpenAPI schema) and using inheritance or composition to share behavior. The trap is **premature abstraction**, the topic of the following section."]),
      h(["Duplicação acidental x duplicação real", "Accidental duplication vs real duplication"]),
      p(["Dois trechos idênticos hoje não representam necessariamente o mesmo conhecimento. Se `validateCustomerName` e `validateProductName` têm o mesmo corpo, mas por razões de negócio distintas, unificá-los acopla duas regras que vão evoluir separadamente: quando o produto passar a aceitar números e o cliente não, você terá flags e condicionais dentro da função compartilhada. Chama-se **duplicação acidental** o código parecido por coincidência, e **duplicação real** o que representa uma mesma regra que sempre muda junto. Só a segunda deve ser eliminada.", "Two identical snippets today do not necessarily represent the same knowledge. If `validateCustomerName` and `validateProductName` have the same body but for different business reasons, merging them couples two rules that will evolve separately: when the product starts accepting numbers and the customer does not, you will have flags and conditionals inside the shared function. **Accidental duplication** is code similar by coincidence, and **real duplication** is what represents one rule that always changes together. Only the latter should be eliminated."]),
      table([["Pergunta de teste", "Test question"], ["Se a resposta for sim", "If the answer is yes"], ["Se a resposta for não", "If the answer is no"]],
        [["Se a regra mudar, os dois lugares precisam mudar juntos?", "If the rule changes, must both places change together?"], ["Duplicação real: unifique", "Real duplication: unify"], ["Duplicação acidental: deixe separado", "Accidental duplication: keep separate"]],
        [["A unificação exige parâmetros booleanos ou flags para distinguir os casos?", "Does unifying require boolean parameters or flags to tell cases apart?"], ["Sinal de acoplamento errado: separe", "Sign of wrong coupling: separate"], ["Provavelmente seguro unificar", "Probably safe to unify"]],
        [["Os dois trechos têm o mesmo dono e o mesmo ritmo de mudança?", "Do both snippets have the same owner and the same rate of change?"], ["Boa candidata a compartilhar", "Good candidate to share"], ["Compartilhar cria dependência entre times", "Sharing creates a dependency between teams"]],
      ),
      h(["A Regra de Três", "The Rule of Three"]),
      p(["Uma heurística popularizada por Martin Fowler no livro de refatoração: *a primeira vez você faz; a segunda, estranha a duplicação mas duplica; na terceira, refatora*. Com uma só ocorrência você não conhece o padrão; com duas ainda é difícil saber o que varia e o que é comum; com três, a forma da abstração costuma ficar clara. Esperar evita criar uma abstração errada, que custa mais caro de desfazer do que a duplicação custa de manter. Não é um número mágico: a regra é um lembrete para não abstrair no escuro.", "A heuristic popularized by Martin Fowler in the refactoring book: *the first time you do it; the second time you wince at duplication but do it anyway; the third time, you refactor*. With a single occurrence you do not know the pattern; with two it is still hard to tell what varies and what is common; with three, the shape of the abstraction usually becomes clear. Waiting avoids creating the wrong abstraction, which is costlier to undo than the duplication is to maintain. It is not a magic number: the rule is a reminder not to abstract in the dark."]),
      h(["KISS: mantenha simples", "KISS: keep it simple"]),
      p(["O acrônimo é creditado ao engenheiro Kelly Johnson, da Lockheed, que desafiava projetistas a criar aviões que um mecânico comum pudesse reparar em campo com ferramentas básicas. Em software, significa escolher a solução mais simples que resolve o problema atual. Simples não é fácil nem curto: é aquele design com menos peças móveis, em que um novo colega entende o fluxo sem diagrama. Cada camada, interface, fábrica ou configuração adiciona uma coisa a mais para entender, depurar e manter.", "The acronym is credited to engineer Kelly Johnson at Lockheed, who challenged designers to build aircraft that an average mechanic could repair in the field with basic tools. In software it means choosing the simplest solution that solves the current problem. Simple is not easy or short: it is the design with fewer moving parts, where a new colleague understands the flow without a diagram. Every layer, interface, factory or setting adds one more thing to understand, debug and maintain."]),
      code(`// Over-complicated: a strategy + factory + registry to say "is the number even?"
interface ParityStrategy { check(n: number): boolean }
class EvenStrategy implements ParityStrategy { check(n: number) { return n % 2 === 0; } }
class ParityFactory { create(): ParityStrategy { return new EvenStrategy(); } }
const isEvenHard = (n: number) => new ParityFactory().create().check(n);

// Simple
const isEven = (n: number) => n % 2 === 0;`),
      ul(
        ["**Prefira código óbvio a código esperto**: um laço claro vence uma linha encadeada que exige decifrar.", "**Prefer obvious code to clever code**: a clear loop beats a chained one-liner that requires deciphering."],
        ["**Funções curtas, com nomes que explicam a intenção**, e poucos níveis de aninhamento (retornos antecipados ajudam).", "**Short functions with names that explain the intent**, and few nesting levels (early returns help)."],
        ["**Use a biblioteca padrão** e recursos da linguagem antes de escrever utilitários próprios.", "**Use the standard library** and language features before writing your own utilities."],
        ["**Meça antes de otimizar**: otimização prematura quase sempre sacrifica simplicidade por ganho que ninguém notaria.", "**Measure before optimizing**: premature optimization almost always sacrifices simplicity for a gain nobody would notice."],
      ),
      h(["YAGNI: você não vai precisar disso", "YAGNI: you aren't gonna need it"]),
      p(["Nascido na *Extreme Programming*, o YAGNI manda **não implementar uma funcionalidade só porque você acha que um dia vai precisar dela**. Os motivos: o requisito provavelmente nunca virá; se vier, será diferente do que você imaginou; o código especulativo custa para escrever, testar, documentar e carregar em toda mudança futura. Exemplos: um campo `middleName` nunca usado, um sistema de plugins para um app com um só cliente, suporte a vários bancos de dados quando só se usa um, um parâmetro de configuração para cada constante.", "Born in *Extreme Programming*, YAGNI says **do not implement a feature just because you think you will need it someday**. The reasons: the requirement will probably never come; if it does, it will differ from what you imagined; speculative code costs to write, test, document and carry through every future change. Examples: a never-used `middleName` field, a plugin system for an app with a single customer, support for multiple databases when only one is used, a configuration parameter for every constant."]),
      p(["YAGNI **não** é licença para ignorar design. Ele vale para *funcionalidades*, não para qualidade. Escrever testes, manter o código limpo e separar responsabilidades continuam obrigatórios: são justamente eles que tornam barato adicionar a funcionalidade quando ela realmente for necessária. Também não se aplica a decisões muito caras de reverter, como o formato de identificadores públicos ou o esquema de migração de dados, que merecem alguma antecipação.", "YAGNI is **not** a license to ignore design. It applies to *features*, not to quality. Writing tests, keeping code clean and separating responsibilities remain mandatory: they are precisely what makes it cheap to add the feature when it is really needed. It also does not apply to decisions that are very costly to reverse, such as the format of public identifiers or the data migration scheme, which deserve some anticipation."]),
      h(["A Lei de Demeter", "The Law of Demeter"]),
      p(["Outra regra prática que reduz acoplamento é a **Lei de Demeter** (*princípio do menor conhecimento*): um método deve falar apenas com seus amigos imediatos, que são o próprio objeto, seus campos, seus parâmetros e objetos que ele cria. Evite cadeias como `order.getCustomer().getAddress().getCity()`, que fazem o chamador conhecer a estrutura interna de três classes. Em vez disso, peça ao objeto a informação de que precisa (`order.shippingCity()`) e deixe que ele navegue sua própria estrutura. Isso permite mudar a estrutura interna sem quebrar chamadores. Observação: encadeamento fluente (como builders ou `array.filter().map()`) não viola a lei, porque cada chamada devolve o mesmo tipo de objeto, sem expor estruturas internas.", "Another practical rule that reduces coupling is the **Law of Demeter** (*principle of least knowledge*): a method should only talk to its immediate friends, which are its own object, its fields, its parameters and objects it creates. Avoid chains such as `order.getCustomer().getAddress().getCity()`, which make the caller know the internal structure of three classes. Instead, ask the object for the information you need (`order.shippingCity()`) and let it navigate its own structure. This allows changing the internal structure without breaking callers. Note: fluent chaining (such as builders or `array.filter().map()`) does not violate the law because each call returns the same kind of object, with no internal structure exposed."]),
      code(`// Violation: the caller walks through the structure of three classes
const city = order.getCustomer().getAddress().getCity();

// Respecting Demeter: Order exposes what callers actually need
class Order {
  constructor(private customer: Customer) {}
  shippingCity(): string { return this.customer.shippingCity(); }
}
class Customer {
  constructor(private address: Address) {}
  shippingCity(): string { return this.address.city; }
}
const city2 = order.shippingCity();`),
      h(["Compor em vez de herdar, e outros companheiros", "Composing instead of inheriting, and other companions"]),
      p(["O princípio *prefira composição a herança* aparece junto com esses três porque também é uma forma de simplicidade: compor peças pequenas é mais fácil de entender do que navegar por uma hierarquia de classes, em que o comportamento está espalhado por vários níveis. Outras regras em linha com as anteriores: **separação de responsabilidades** (cada parte cuida de um assunto), **princípio da menor surpresa** (um nome ou método deve fazer o que o leitor espera) e **\"tell, don't ask\"** (mande o objeto agir em vez de consultar o estado dele para decidir).", "The principle *favor composition over inheritance* appears alongside these three because it is also a form of simplicity: composing small parts is easier to understand than navigating a class hierarchy where behavior is scattered across levels. Other rules in line with the previous ones: **separation of concerns** (each part handles one subject), **principle of least surprise** (a name or method should do what the reader expects) and **tell, don't ask** (tell the object to act instead of querying its state to decide)."]),
      h(["Trade-offs: quando duplicar é melhor", "Trade-offs: when duplicating is better"]),
      p(["O custo de uma abstração errada é maior que o de uma duplicação. Uma frase conhecida de Sandi Metz resume: *a duplicação é muito mais barata que a abstração errada*. Situações em que vale duplicar:", "The cost of a wrong abstraction is higher than that of duplication. A well-known phrase by Sandi Metz sums it up: *duplication is far cheaper than the wrong abstraction*. Situations in which duplicating is worth it:"]),
      ul(
        ["**Antes da terceira ocorrência**, quando ainda não se vê o padrão.", "**Before the third occurrence**, when the pattern is not yet visible."],
        ["**Entre serviços ou bounded contexts diferentes**: compartilhar uma biblioteca de modelos entre microsserviços cria acoplamento de deploy; copiar um DTO pequeno costuma sair mais barato.", "**Across different services or bounded contexts**: sharing a model library between microservices creates deploy coupling; copying a small DTO is often cheaper."],
        ["**Em testes**: um pouco de repetição deixa cada teste legível por si só; abstrair demais os testes os torna enigmáticos.", "**In tests**: a bit of repetition keeps each test readable on its own; over-abstracting tests makes them cryptic."],
        ["**Quando a unificação exigiria flags e condicionais** para tratar casos que divergem.", "**When unification would require flags and conditionals** to handle diverging cases."],
        ["**Código com ritmos de mudança diferentes**, como a regra fiscal de um país e a de outro.", "**Code with different rates of change**, such as the tax rule of one country and another's."],
      ),
      table([["Princípio", "Principle"], ["Pergunta que faz", "Question it asks"], ["Risco se exagerado", "Risk if overdone"]],
        [["DRY", "DRY"], ["Este conhecimento existe em um só lugar?", "Does this knowledge live in only one place?"], ["Abstrações erradas que acoplam coisas que só se parecem", "Wrong abstractions that couple things that merely look alike"]],
        [["KISS", "KISS"], ["Existe um jeito mais simples de resolver?", "Is there a simpler way to solve it?"], ["Soluções ingênuas que não suportam o requisito real", "Naive solutions that do not support the real requirement"]],
        [["YAGNI", "YAGNI"], ["Preciso disso agora?", "Do I need this now?"], ["Falta de preparação em decisões caras de reverter", "Lack of preparation in decisions that are costly to reverse"]],
        [["Demeter", "Demeter"], ["Estou conhecendo a estrutura interna de outro objeto?", "Am I learning the internal structure of another object?"], ["Muitos métodos de repasse em classes intermediárias", "Many forwarding methods on intermediate classes"]],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["DRY trata de conhecimento duplicado, não de texto parecido; elimine apenas a duplicação real.", "DRY is about duplicated knowledge, not similar text; eliminate only real duplication."],
        ["Regra de Três: abstraia na terceira repetição, quando o padrão está claro.", "Rule of Three: abstract on the third repetition, when the pattern is clear."],
        ["KISS: escolha a solução mais simples que resolve o problema de hoje.", "KISS: choose the simplest solution that solves today's problem."],
        ["YAGNI: não construa funcionalidades especulativas, mas mantenha o código limpo e testado.", "YAGNI: do not build speculative features, but keep the code clean and tested."],
        ["Demeter: fale com amigos próximos e evite cadeias de chamadas pela estrutura alheia.", "Demeter: talk to close friends and avoid call chains through other objects' structure."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**DRY significa nunca copiar código?** Não. Significa não duplicar o mesmo conhecimento. Cópias com razões de mudança diferentes podem ser saudáveis.", "**Does DRY mean never copying code?** No. It means not duplicating the same knowledge. Copies with different reasons to change can be healthy."],
        ["**KISS e YAGNI são a mesma coisa?** São parentes: KISS fala da forma da solução e YAGNI do escopo do que se constrói.", "**Are KISS and YAGNI the same thing?** They are relatives: KISS is about the shape of the solution and YAGNI about the scope of what is built."],
        ["**Como equilibrar YAGNI e extensibilidade?** Construa o necessário com código limpo e testes; assim, estender depois custa pouco.", "**How do I balance YAGNI and extensibility?** Build what is needed with clean code and tests; then extending later costs little."],
        ["**A Lei de Demeter proíbe o encadeamento fluente?** Não, desde que cada chamada devolva o mesmo tipo e não exponha estruturas internas.", "**Does the Law of Demeter forbid fluent chaining?** No, as long as each call returns the same type and does not expose internal structures."],
      ),
      tip(["Quando a revisão de código apontar duplicação, pergunte primeiro se é duplicação de conhecimento. Se a resposta for não, deixe como está e anote para reavaliar na terceira ocorrência.", "When code review points out duplication, first ask whether it is duplication of knowledge. If not, leave it as is and make a note to reassess at the third occurrence."]),
    ] },
  { id: "uml", section: "lld", level: 1, icon: "account_tree", minutes: 12,
    title: ["UML na prática", "UML in practice"],
    summary: ["Diagramas de classes, sequência, casos de uso, atividade, estados e componentes, com exemplos e a notação dos relacionamentos.", "Class, sequence, use case, activity, state and component diagrams, with examples and the notation of relationships."],
    body: [
      p(["**UML** (*Unified Modeling Language*) é uma linguagem gráfica padronizada, mantida pelo OMG, para descrever sistemas de software. Nasceu nos anos 1990 da união dos métodos de Booch, Rumbaugh e Jacobson e hoje está na versão 2.x. UML não é um processo nem exige uma ferramenta: é um vocabulário de caixas e setas que permite a pessoas diferentes conversarem sobre o mesmo desenho. Na prática moderna usa-se um subconjunto pequeno, desenhado rápido (em quadro branco, em texto com Mermaid ou PlantUML) para pensar e comunicar, não para gerar documentação burocrática.", "**UML** (*Unified Modeling Language*) is a standardized graphical language, maintained by the OMG, to describe software systems. It was born in the 1990s from the union of the methods of Booch, Rumbaugh and Jacobson and is currently at version 2.x. UML is neither a process nor does it require a tool: it is a vocabulary of boxes and arrows that lets different people talk about the same drawing. In modern practice a small subset is used, drawn quickly (on a whiteboard, or as text with Mermaid or PlantUML) to think and communicate, not to produce bureaucratic documentation."]),
      p(["Os diagramas dividem-se em dois grupos. Os **estruturais** mostram o que existe (classes, componentes, implantação). Os **comportamentais** mostram o que acontece (casos de uso, sequência, atividade, estados). Em LLD, seis diagramas cobrem quase tudo.", "Diagrams fall into two groups. **Structural** ones show what exists (classes, components, deployment). **Behavioral** ones show what happens (use cases, sequence, activity, states). In LLD, six diagrams cover almost everything."]),
      table([["Diagrama", "Diagram"], ["Tipo", "Kind"], ["Responde a", "Answers"], ["Quando usar", "When to use"]],
        [["Classes", "Class"], ["Estrutural", "Structural"], ["Quais classes existem e como se relacionam?", "Which classes exist and how do they relate?"], ["Sempre em LLD, para o modelo do domínio", "Always in LLD, for the domain model"]],
        [["Sequência", "Sequence"], ["Comportamental", "Behavioral"], ["Quem chama quem, em que ordem?", "Who calls whom, in what order?"], ["Para validar um fluxo ou uma integração", "To validate a flow or an integration"]],
        [["Casos de uso", "Use case"], ["Comportamental", "Behavioral"], ["Quem usa o sistema e para quê?", "Who uses the system and for what?"], ["No começo, para delimitar o escopo", "At the start, to delimit scope"]],
        [["Atividade", "Activity"], ["Comportamental", "Behavioral"], ["Quais passos e decisões compõem um processo?", "Which steps and decisions make up a process?"], ["Fluxos de negócio com ramificações e paralelismo", "Business flows with branching and parallelism"]],
        [["Estados", "State"], ["Comportamental", "Behavioral"], ["Em quais estados um objeto fica e o que o faz mudar?", "Which states does an object go through and what changes it?"], ["Objetos com ciclo de vida (pedido, vaga, ingresso)", "Objects with a lifecycle (order, spot, ticket)"]],
        [["Componentes", "Component"], ["Estrutural", "Structural"], ["Quais módulos e interfaces compõem o sistema?", "Which modules and interfaces make up the system?"], ["Para mostrar fronteiras de módulos e dependências", "To show module boundaries and dependencies"]],
      ),
      h(["Diagrama de classes", "Class diagram"]),
      p(["É o diagrama mais usado. Cada classe é um retângulo com três compartimentos: nome, atributos e métodos. A visibilidade aparece como prefixo: `+` público, `-` privado, `#` protegido. Classes abstratas e interfaces são marcadas com *itálico* ou com o estereótipo «interface». As linhas entre as classes representam relacionamentos, descritos na tabela abaixo, com **multiplicidade** nas pontas (`1`, `0..1`, `*`, `1..*`).", "It is the most used diagram. Each class is a rectangle with three compartments: name, attributes and methods. Visibility appears as a prefix: `+` public, `-` private, `#` protected. Abstract classes and interfaces are marked with *italics* or with the «interface» stereotype. Lines between classes represent relationships, described in the table below, with **multiplicity** at the ends (`1`, `0..1`, `*`, `1..*`)."]),
      table([["Relacionamento", "Relationship"], ["Notação", "Notation"], ["Lê-se", "Reads as"], ["Exemplo", "Example"]],
        [["Associação", "Association"], ["Linha simples, às vezes com seta", "Plain line, sometimes with arrow"], ["conhece / usa de forma duradoura", "knows / uses durably"], ["`Customer --> Order`", "`Customer --> Order`"]],
        [["Agregação", "Aggregation"], ["Linha com losango vazio no lado do todo", "Line with hollow diamond on the whole's side"], ["tem (a parte vive sozinha)", "has (part lives alone)"], ["`Team o-- Player`", "`Team o-- Player`"]],
        [["Composição", "Composition"], ["Linha com losango preenchido no lado do todo", "Line with filled diamond on the whole's side"], ["é feito de (a parte morre junto)", "is made of (part dies with it)"], ["`House *-- Room`", "`House *-- Room`"]],
        [["Herança (generalização)", "Inheritance (generalization)"], ["Linha contínua com triângulo vazio na superclasse", "Solid line with hollow triangle at the superclass"], ["é um", "is a"], ["`Circle --|> Shape`", "`Circle --|> Shape`"]],
        [["Realização", "Realization"], ["Linha tracejada com triângulo vazio na interface", "Dashed line with hollow triangle at the interface"], ["implementa", "implements"], ["`Card ..|> Payable`", "`Card ..|> Payable`"]],
        [["Dependência", "Dependency"], ["Seta tracejada", "Dashed arrow"], ["usa de passagem", "uses in passing"], ["`Service ..> Logger`", "`Service ..> Logger`"]],
      ),
      code(`classDiagram
  class Shape {
    <<abstract>>
    +area() number
  }
  class Circle {
    -radius number
    +area() number
  }
  class Drawing {
    -shapes Shape[]
    +add(s Shape)
    +totalArea() number
  }
  class Canvas
  Circle --|> Shape
  Drawing o-- Shape : 0..*
  Drawing *-- Canvas : 1
  Drawing ..> Logger`),
      fig(["Diagrama de classes de uma biblioteca (resumo)", "Library class diagram (summary)"], [
        [node("lib", "Library", "service")],
        [node("book", "Book", "data"), node("member", "Member", "client")],
        [node("copy", ["BookCopy", "BookCopy"], "data"), node("loan", "Loan", "queue")],
      ], [edge("lib", "book", "1..*"), edge("lib", "member", "0..*"), edge("book", "copy", "1..*"), edge("member", "loan", "0..*"), edge("loan", "copy", "1")]),
      h(["Diagrama de sequência", "Sequence diagram"]),
      p(["Mostra a **ordem das mensagens** entre participantes ao longo do tempo. Cada participante tem uma *linha de vida* vertical; as setas horizontais são chamadas, e o tempo corre de cima para baixo. Setas cheias são chamadas síncronas, tracejadas são retornos, e blocos como `alt` (alternativa), `opt` (opcional) e `loop` agrupam condições e repetições. Ele é ideal para validar se o desenho de classes consegue realizar um caso de uso, e para documentar integrações entre serviços.", "It shows the **order of messages** between participants over time. Each participant has a vertical *lifeline*; horizontal arrows are calls, and time flows from top to bottom. Solid arrows are synchronous calls, dashed ones are returns, and blocks such as `alt` (alternative), `opt` (optional) and `loop` group conditions and repetitions. It is ideal to validate whether the class design can realize a use case, and to document integrations between services."]),
      code(`sequenceDiagram
  participant U as User
  participant C as CheckoutService
  participant P as PaymentGateway
  participant R as OrderRepository
  U->>C: placeOrder(cart)
  C->>P: charge(card, total)
  alt payment accepted
    P-->>C: ok(txId)
    C->>R: save(order)
    C-->>U: confirmation
  else payment refused
    P-->>C: declined
    C-->>U: error
  end`),
      h(["Diagrama de casos de uso", "Use case diagram"]),
      p(["Responde *quem faz o quê com o sistema*. Os **atores** (bonecos) são pessoas ou sistemas externos; os **casos de uso** (elipses) são objetivos que o ator quer alcançar; uma fronteira retangular delimita o sistema. Relacionamentos entre casos de uso: `include` (um caso sempre usa outro, como Comprar inclui Autenticar) e `extend` (comportamento opcional que estende o principal, como Aplicar cupom). Não descreve o *como*; serve para alinhar o escopo com quem não é técnico e para derivar requisitos.", "It answers *who does what with the system*. **Actors** (stick figures) are people or external systems; **use cases** (ellipses) are goals the actor wants to achieve; a rectangular boundary delimits the system. Relationships between use cases: `include` (one case always uses another, such as Buy including Authenticate) and `extend` (optional behavior extending the main one, such as Apply coupon). It does not describe the *how*; it serves to align scope with non-technical people and to derive requirements."]),
      code(`          +-------------- Parking System ---------------+
          |                                               |
 Driver --+---> (Take ticket)                             |
   |      |                                               |
   +------+---> (Pay)  ..include..>  (Validate ticket)    |
          |        ^                                      |
          |        . extend                               |
          |   (Apply discount)                            |
 Attendant+---> (Open gate manually)                      |
          |                                               |
 Card API +<--- (Pay)                                     |
          +-----------------------------------------------+`),
      h(["Diagrama de atividade", "Activity diagram"]),
      p(["É um fluxograma enriquecido: círculo preenchido para o início, círculo com borda para o fim, retângulos arredondados para ações, losangos para decisões e barras para **bifurcar** e **juntar** fluxos paralelos. As *raias* (swimlanes) mostram quem executa cada passo. Serve para processos de negócio e algoritmos com ramificações, como o processamento de um pedido, em que cobrança e reserva de estoque ocorrem em paralelo.", "It is an enriched flowchart: a filled circle for the start, a circle with border for the end, rounded rectangles for actions, diamonds for decisions and bars to **fork** and **join** parallel flows. *Swimlanes* show who performs each step. It serves business processes and algorithms with branching, such as order processing, where charging and stock reservation happen in parallel."]),
      code(`flowchart TD
  A([Start]) --> B[Receive order]
  B --> C{Items in stock?}
  C -- no --> D[Notify customer] --> Z([End])
  C -- yes --> E[Charge card]
  C -- yes --> F[Reserve stock]
  E --> G{Paid?}
  F --> H[Join]
  G -- yes --> H
  G -- no --> D
  H --> I[Ship order] --> Z`),
      h(["Diagrama de estados", "State diagram"]),
      p(["Descreve os **estados** de um objeto, as **transições** entre eles, os eventos que as disparam e as condições de guarda. É a ferramenta certa para qualquer entidade com ciclo de vida: pedido (criado, pago, enviado, entregue, cancelado), ingresso, conexão de rede, vaga de estacionamento. Um bom diagrama de estados expõe transições impossíveis ou esquecidas (um pedido entregue pode ser cancelado?), e é a base direta do padrão State.", "It describes an object's **states**, the **transitions** between them, the events that trigger them and guard conditions. It is the right tool for any entity with a lifecycle: order (created, paid, shipped, delivered, cancelled), ticket, network connection, parking spot. A good state diagram exposes impossible or forgotten transitions (can a delivered order be cancelled?), and is the direct basis for the State pattern."]),
      code(`stateDiagram-v2
  [*] --> Created
  Created --> Paid: pay()
  Created --> Cancelled: cancel()
  Paid --> Shipped: ship()
  Paid --> Cancelled: cancel() / refund
  Shipped --> Delivered: confirm()
  Delivered --> [*]
  Cancelled --> [*]`),
      h(["Diagrama de componentes", "Component diagram"]),
      p(["Mostra os módulos do sistema como caixas com **interfaces fornecidas** (círculo, o que o componente oferece) e **requeridas** (meio círculo, o que ele consome), conectadas entre si. É o diagrama de ports and adapters em linguagem UML, e conecta o LLD ao HLD, pois um componente pode ser um módulo, um pacote ou um serviço. Útil para discutir fronteiras e dependências circulares.", "It shows the system's modules as boxes with **provided interfaces** (circle, what the component offers) and **required** ones (half circle, what it consumes), connected to each other. It is the ports and adapters diagram in UML language, and it connects LLD to HLD, since a component can be a module, a package or a service. Useful to discuss boundaries and circular dependencies."]),
      fig(["Diagrama de componentes de um e-commerce", "Component diagram of an e-commerce"], [
        [node("web", ["Web UI", "Web UI"], "client")],
        [node("orders", ["Orders", "Orders"], "service"), node("catalog", ["Catalog", "Catalog"], "service")],
        [node("pay", ["Payments", "Payments"], "service")],
        [node("db", ["Orders DB", "Orders DB"], "data"), node("psp", ["Payment provider", "Payment provider"], "ext")],
      ], [edge("web", "orders", "IOrders"), edge("web", "catalog", "ICatalog"), edge("orders", "pay", "IPayments"), edge("orders", "db"), edge("pay", "psp", "", { dashed: true })]),
      h(["Mermaid, PlantUML e quando desenhar", "Mermaid, PlantUML and when to draw"]),
      p(["Ferramentas **texto para diagrama**, como Mermaid e PlantUML, permitem versionar o desenho junto do código e revisá-lo em pull requests; Mermaid é renderizado diretamente por plataformas como GitHub e GitLab. Ferramentas visuais (draw.io, Lucidchart, Excalidraw) são mais rápidas para rascunhos. Regras de bolso: desenhe **para pensar** e **para comunicar**, não para documentar tudo; mantenha os diagramas pequenos, com um propósito claro (um fluxo, um módulo) e jogue fora os que ninguém atualiza, pois um diagrama desatualizado é pior que nenhum.", "**Text-to-diagram** tools, such as Mermaid and PlantUML, let you version the drawing alongside the code and review it in pull requests; Mermaid is rendered directly by platforms such as GitHub and GitLab. Visual tools (draw.io, Lucidchart, Excalidraw) are faster for sketches. Rules of thumb: draw **to think** and **to communicate**, not to document everything; keep diagrams small, with a clear purpose (one flow, one module) and discard those nobody updates, since an outdated diagram is worse than none."]),
      code(`// A tiny use of text diagrams: ASCII class box
+------------------+
|   ParkingLot     |
+------------------+
| - floors: Floor[]|
+------------------+
| + park(v): Ticket|
| + exit(t): Fee   |
+------------------+
        | 1
        | has
        v *
+------------------+
|      Floor       |
+------------------+`),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["**Diagrama de classes com tudo**: incluir cada atributo e método vira ruído. Mostre apenas o necessário para a conversa.", "**A class diagram with everything**: including every attribute and method becomes noise. Show only what the conversation needs."],
        ["**Confundir agregação com composição**: quando em dúvida, use associação simples; a diferença sutil raramente importa para decisões.", "**Confusing aggregation with composition**: when in doubt, use a plain association; the subtle difference rarely matters for decisions."],
        ["**Setas sem significado**: toda seta precisa de um tipo definido e, quando útil, de um rótulo.", "**Arrows without meaning**: every arrow needs a defined type and, when useful, a label."],
        ["**Desenhar antes de entender o problema**: comece com casos de uso e fluxos.", "**Drawing before understanding the problem**: start with use cases and flows."],
        ["**Tratar o diagrama como entrega final**: ele serve ao código, não o contrário.", "**Treating the diagram as the final deliverable**: it serves the code, not the other way around."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["UML é um vocabulário visual comum; use um subconjunto pequeno.", "UML is a common visual vocabulary; use a small subset."],
        ["Classes mostram estrutura; sequência mostra a ordem das chamadas; casos de uso definem escopo.", "Classes show structure; sequence shows call order; use cases define scope."],
        ["Atividade descreve processos, estados descrevem ciclos de vida e componentes mostram fronteiras.", "Activity describes processes, states describe lifecycles and components show boundaries."],
        ["Conheça a notação: associação, agregação, composição, herança, realização e dependência.", "Know the notation: association, aggregation, composition, inheritance, realization and dependency."],
        ["Prefira diagramas em texto versionados e pequenos.", "Prefer small, versioned text diagrams."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**UML ainda é usado?** Sim, em uma forma leve: diagramas de classes e sequência em quadros e em documentos de design, não modelagem completa.", "**Is UML still used?** Yes, in a light form: class and sequence diagrams on whiteboards and in design documents, not complete modeling."],
        ["**Em entrevistas de LLD, preciso desenhar UML perfeito?** Não. Clareza vale mais que notação exata; mas conhecer os símbolos básicos ajuda a conversar.", "**In LLD interviews do I need to draw perfect UML?** No. Clarity matters more than exact notation; but knowing the basic symbols helps the conversation."],
        ["**Qual a diferença entre diagrama de atividade e de sequência?** Atividade foca no fluxo de passos e decisões; sequência foca em quem troca mensagens com quem.", "**What is the difference between an activity and a sequence diagram?** Activity focuses on the flow of steps and decisions; sequence focuses on who exchanges messages with whom."],
        ["**UML gera código?** Ferramentas conseguem, mas na prática o código costuma ser a fonte de verdade e o diagrama um apoio.", "**Does UML generate code?** Tools can, but in practice the code tends to be the source of truth and the diagram a support."],
      ),
      tip(["Se você só puder aprender dois diagramas, aprenda o de classes e o de sequência: o primeiro mostra o que existe, o segundo prova que o desenho funciona.", "If you can only learn two diagrams, learn the class and the sequence diagram: the first shows what exists, the second proves the design works."]),
    ] },
  { id: "padroes-de-projeto-criacionais", section: "lld", level: 1, icon: "construction", minutes: 11,
    title: ["Padrões de projeto: visão geral e criacionais", "Design patterns: overview and creational"],
    summary: ["O que são padrões de projeto, as três famílias do catálogo GoF e um panorama dos criacionais (Singleton, Factory Method, Abstract Factory, Builder, Prototype).", "What design patterns are, the three families of the GoF catalog and an overview of the creational ones (Singleton, Factory Method, Abstract Factory, Builder, Prototype)."],
    body: [
      p(["Quem desenvolve software por tempo suficiente percebe que certos problemas de design reaparecem: como criar objetos sem acoplar o código a classes concretas, como trocar um algoritmo em tempo de execução, como avisar vários objetos quando algo muda. Um **padrão de projeto** (*design pattern*) é uma solução nomeada e testada pelo tempo para um problema recorrente de design em um certo contexto. Não é código pronto para copiar nem uma biblioteca: é uma *receita de estrutura* que você adapta. O catálogo mais famoso vem do livro *Design Patterns: Elements of Reusable Object-Oriented Software* (1994), dos autores Gamma, Helm, Johnson e Vlissides, conhecidos como a *Gang of Four* (**GoF**), com 23 padrões.", "Anyone developing software for long enough notices that certain design problems recur: how to create objects without coupling the code to concrete classes, how to swap an algorithm at run time, how to notify several objects when something changes. A **design pattern** is a named, time-tested solution to a recurring design problem in a certain context. It is neither ready-made code to copy nor a library: it is a *structure recipe* you adapt. The most famous catalog comes from the book *Design Patterns: Elements of Reusable Object-Oriented Software* (1994), by Gamma, Helm, Johnson and Vlissides, known as the *Gang of Four* (**GoF**), with 23 patterns."]),
      h(["Para que servem os padrões", "What patterns are for"]),
      ul(
        ["**Vocabulário comum**: dizer *use um Observer aqui* comunica em três palavras uma estrutura inteira, o que acelera revisões e discussões de design.", "**A shared vocabulary**: saying *use an Observer here* communicates a whole structure in a few words, which speeds up reviews and design discussions."],
        ["**Soluções comprovadas**: evitam reinventar mal o que muita gente já resolveu bem, incluindo os efeitos colaterais conhecidos.", "**Proven solutions**: they avoid badly reinventing what many people have already solved well, including the known side effects."],
        ["**Aplicação dos princípios**: quase todo padrão é uma combinação de composição, interfaces e inversão de dependência (os princípios SOLID em ação).", "**Applying the principles**: almost every pattern is a combination of composition, interfaces and dependency inversion (SOLID principles in action)."],
        ["**Leitura de código alheio**: frameworks usam padrões em todo lugar; reconhecê-los torna a base de código menos misteriosa.", "**Reading other people's code**: frameworks use patterns everywhere; recognizing them makes the codebase less mysterious."],
      ),
      h(["As três famílias", "The three families"]),
      p(["O catálogo GoF organiza os padrões de acordo com o problema que atacam. **Criacionais** tratam de *como objetos são criados*. **Estruturais** tratam de *como objetos e classes se compõem em estruturas maiores*. **Comportamentais** tratam de *como objetos se comunicam e dividem responsabilidades*. Os dois artigos seguintes dão o panorama das duas últimas famílias, e cada padrão importante tem seu artigo próprio.", "The GoF catalog organizes patterns according to the problem they attack. **Creational** ones deal with *how objects are created*. **Structural** ones deal with *how objects and classes are composed into larger structures*. **Behavioral** ones deal with *how objects communicate and share responsibilities*. The next two articles give an overview of the last two families, and each important pattern has its own article."]),
      fig(["O catálogo GoF: 23 padrões em três famílias", "The GoF catalog: 23 patterns in three families"], [
        [node("gof", ["Padrões GoF", "GoF patterns"], "client")],
        [node("cre", ["Criacionais (5)", "Creational (5)"], "service"), node("str", ["Estruturais (7)", "Structural (7)"], "service"), node("beh", ["Comportamentais (11)", "Behavioral (11)"], "service")],
        [node("c1", "Singleton Factory Builder", "data"), node("s1", "Adapter Decorator Facade Proxy", "data"), node("b1", "Strategy Observer Command State", "data")],
      ], [edge("gof", "cre"), edge("gof", "str"), edge("gof", "beh"), edge("cre", "c1"), edge("str", "s1"), edge("beh", "b1")]),
      h(["Como ler um padrão", "How to read a pattern"]),
      p(["Cada padrão do catálogo é descrito com os mesmos elementos, e usar essa estrutura ao estudá-los ajuda a decidir se um padrão se aplica ao seu caso.", "Each catalog pattern is described with the same elements, and using that structure when studying them helps decide whether a pattern applies to your case."]),
      table([["Elemento", "Element"], ["Pergunta que responde", "Question it answers"]],
        [["Nome e intenção", "Name and intent"], ["O que o padrão faz, em uma frase?", "What does the pattern do, in one sentence?"]],
        [["Problema e contexto", "Problem and context"], ["Em que situação ele é a resposta certa?", "In which situation is it the right answer?"]],
        [["Estrutura e participantes", "Structure and participants"], ["Quais classes e interfaces existem e como se ligam?", "Which classes and interfaces exist and how are they linked?"]],
        [["Consequências", "Consequences"], ["Que benefícios e custos ele traz?", "What benefits and costs does it bring?"]],
        [["Padrões relacionados", "Related patterns"], ["Com quais outros ele se confunde ou se combina?", "Which others is it confused with or combined with?"]],
      ),
      h(["Padrões criacionais: o problema comum", "Creational patterns: the common problem"]),
      p(["Usar `new` diretamente espalha pelo código a decisão de *qual* classe concreta instanciar e *como* configurá-la. Isso acopla o chamador à implementação, dificulta trocar uma classe por outra (inclusive em testes) e deixa a construção de objetos complexos poluída por detalhes. Os padrões criacionais isolam essa decisão: escondem quem cria, o que é criado ou como é montado, para que o restante do código dependa apenas de abstrações.", "Using `new` directly spreads across the code the decision of *which* concrete class to instantiate and *how* to configure it. That couples the caller to the implementation, makes swapping one class for another hard (including in tests) and pollutes the construction of complex objects with details. Creational patterns isolate that decision: they hide who creates, what is created or how it is assembled, so the rest of the code depends only on abstractions."]),
      table([["Padrão", "Pattern"], ["Intenção", "Intent"], ["Use quando", "Use when"], ["Exemplo", "Example"]],
        [["Singleton", "Singleton"], ["Garantir uma única instância com ponto de acesso global", "Ensure a single instance with a global access point"], ["Há exatamente um recurso compartilhado (com cautela)", "There is exactly one shared resource (with caution)"], ["Configuração, pool de conexões", "Configuration, connection pool"]],
        [["Factory Method", "Factory Method"], ["Delegar a criação a um método que subclasses ou configuração decidem", "Delegate creation to a method decided by subclasses or configuration"], ["O código não sabe de antemão qual classe criar", "The code does not know in advance which class to create"], ["Criar o tipo de notificação por canal", "Creating the notification type per channel"]],
        [["Abstract Factory", "Abstract Factory"], ["Criar famílias de objetos relacionados sem citar classes concretas", "Create families of related objects without naming concrete classes"], ["Os produtos devem combinar entre si (tema claro/escuro)", "Products must match each other (light/dark theme)"], ["Kits de widgets por plataforma", "Widget kits per platform"]],
        [["Builder", "Builder"], ["Construir objetos complexos passo a passo", "Build complex objects step by step"], ["Construtor com muitos parâmetros, opcionais ou etapas", "Constructor with many parameters, optional ones or stages"], ["Montar uma consulta, uma requisição HTTP", "Assembling a query, an HTTP request"]],
        [["Prototype", "Prototype"], ["Criar novos objetos copiando um existente", "Create new objects by copying an existing one"], ["Criar do zero é caro, ou a configuração é complexa", "Creating from scratch is costly, or configuration is complex"], ["Duplicar um documento ou personagem de jogo", "Duplicating a document or game character"]],
      ),
      h(["Singleton em poucas palavras", "Singleton in a few words"]),
      p(["O Singleton garante que uma classe tenha uma só instância e fornece um ponto global de acesso a ela. É o padrão mais conhecido e também o mais criticado, porque o acesso global esconde dependências e dificulta testes. Veja o artigo dedicado para variações seguras (injeção de uma instância única), código completo e armadilhas de concorrência.", "Singleton guarantees a class has a single instance and provides a global access point to it. It is the best-known pattern and also the most criticized, because global access hides dependencies and makes testing harder. See the dedicated article for safer variations (injecting a single instance), complete code and concurrency pitfalls."]),
      h(["Factory Method e Abstract Factory em poucas palavras", "Factory Method and Abstract Factory in a few words"]),
      p(["No **Factory Method**, uma operação de criação é declarada em uma interface ou classe base e cada variante decide qual produto concreto instanciar; o chamador só usa o produto abstrato. A **Abstract Factory** sobe um nível: uma fábrica cria vários produtos que pertencem à mesma família (botão, caixa de texto e menu em um tema), garantindo que combinem. Há ainda a *Simple Factory*, uma função com um `switch` que devolve o objeto certo, útil e comum embora não seja um padrão GoF formal. Os detalhes estão no artigo de Factory.", "In **Factory Method**, a creation operation is declared in an interface or base class and each variant decides which concrete product to instantiate; the caller only uses the abstract product. **Abstract Factory** goes one level up: a factory creates several products that belong to the same family (button, text box and menu in a theme), ensuring they match. There is also the *Simple Factory*, a function with a `switch` that returns the right object, useful and common though not a formal GoF pattern. The details are in the Factory article."]),
      h(["Builder e Prototype em poucas palavras", "Builder and Prototype in a few words"]),
      p(["O **Builder** separa a construção de um objeto complexo da sua representação final: em vez de um construtor com doze argumentos (o *telescoping constructor*), você chama métodos nomeados que configuram cada parte e, no fim, `build()` valida e entrega o objeto. Ele é a cura para construtores ilegíveis e permite objetos imutáveis. O **Prototype** cria objetos clonando uma instância existente (`clone()`), evitando o custo ou a complexidade de montá-los do zero; em JavaScript, a própria herança por protótipos e a função `structuredClone` são parentes dessa ideia.", "**Builder** separates the construction of a complex object from its final representation: instead of a constructor with twelve arguments (the *telescoping constructor*), you call named methods that configure each part and, at the end, `build()` validates and delivers the object. It is the cure for unreadable constructors and enables immutable objects. **Prototype** creates objects by cloning an existing instance (`clone()`), avoiding the cost or complexity of assembling them from scratch; in JavaScript, prototype inheritance itself and the `structuredClone` function are relatives of that idea."]),
      code(`// Prototype in a nutshell
interface Cloneable<T> { clone(): T }
class Enemy implements Cloneable<Enemy> {
  constructor(public hp: number, public weapons: string[]) {}
  clone(): Enemy { return new Enemy(this.hp, [...this.weapons]); }   // copy mutable parts too
}
const base = new Enemy(100, ["sword"]);
const orc = base.clone(); orc.hp = 150;       // base is untouched`),
      h(["Como escolher entre os criacionais", "How to choose among the creational ones"]),
      fig(["Árvore de decisão simplificada", "Simplified decision tree"], [
        [node("q", ["Preciso controlar a criação?", "Do I need to control creation?"], "client")],
        [node("one", ["Só uma instância?", "Only one instance?"], "edge"), node("many", ["Qual classe criar varia?", "Which class to create varies?"], "edge"), node("complex", ["Objeto com muitos passos?", "Object with many steps?"], "edge")],
        [node("sing", ["Singleton ou instância injetada", "Singleton or injected instance"], "service"), node("fac", ["Factory Method / Abstract Factory", "Factory Method / Abstract Factory"], "service"), node("bui", ["Builder ou Prototype", "Builder or Prototype"], "service")],
      ], [edge("q", "one"), edge("q", "many"), edge("q", "complex"), edge("one", "sing"), edge("many", "fac"), edge("complex", "bui")]),
      h(["Exemplos de uso real", "Real-world uses"]),
      ul(
        ["**Singleton**: o objeto `Runtime` de Java expõe a instância única via `Runtime.getRuntime()`; em Spring, os beans têm escopo singleton por padrão (um por contêiner, não global).", "**Singleton**: Java's `Runtime` object exposes its single instance via `Runtime.getRuntime()`; in Spring, beans have singleton scope by default (one per container, not global)."],
        ["**Factory**: `Calendar.getInstance()` em Java, `document.createElement` no DOM e `React.createElement` decidem o que criar a partir de um argumento.", "**Factory**: `Calendar.getInstance()` in Java, `document.createElement` in the DOM and `React.createElement` decide what to create from an argument."],
        ["**Builder**: `StringBuilder` em Java, `UriComponentsBuilder` no Spring e `QueryBuilder` de vários ORMs montam o resultado por etapas.", "**Builder**: `StringBuilder` in Java, `UriComponentsBuilder` in Spring and the `QueryBuilder` of several ORMs assemble the result in stages."],
        ["**Prototype**: `Object.create` e `structuredClone` em JavaScript; `Cloneable` em Java.", "**Prototype**: `Object.create` and `structuredClone` in JavaScript; `Cloneable` in Java."],
      ),
      h(["Erros comuns ao usar padrões", "Common mistakes when using patterns"]),
      ul(
        ["**Padrão como objetivo**: começar o design por *qual padrão vou usar* em vez de *qual problema tenho*. O padrão deve aparecer porque a dor existe.", "**Pattern as goal**: starting design from *which pattern will I use* instead of *which problem do I have*. The pattern should appear because the pain exists."],
        ["**Aplicar à força em linguagens que já resolvem**: em linguagens com funções de primeira classe, muitos padrões (Strategy, Command, Observer) se reduzem a passar uma função.", "**Forcing them in languages that already solve it**: in languages with first-class functions, many patterns (Strategy, Command, Observer) reduce to passing a function."],
        ["**Confundir padrões parecidos**: Strategy x State, Decorator x Proxy, Adapter x Facade têm estruturas semelhantes e intenções diferentes. Compare sempre pela intenção.", "**Confusing similar patterns**: Strategy vs State, Decorator vs Proxy, Adapter vs Facade have similar structures and different intents. Always compare by intent."],
        ["**Abusar do Singleton** como variável global disfarçada.", "**Abusing Singleton** as a disguised global variable."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Um padrão de projeto é uma solução nomeada para um problema recorrente de design, não código pronto.", "A design pattern is a named solution to a recurring design problem, not ready-made code."],
        ["O GoF tem 23 padrões em três famílias: criacionais, estruturais e comportamentais.", "The GoF has 23 patterns in three families: creational, structural and behavioral."],
        ["Os criacionais isolam a decisão de quem cria o quê e como: Singleton, Factory Method, Abstract Factory, Builder e Prototype.", "Creational patterns isolate the decision of who creates what and how: Singleton, Factory Method, Abstract Factory, Builder and Prototype."],
        ["Escolha pelo problema e pela intenção, e prefira a solução mais simples que resolva.", "Choose by problem and intent, and prefer the simplest solution that works."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Preciso decorar os 23 padrões?** Não. Conhecer bem uma dúzia dos mais usados e a intenção dos demais já basta; o resto se consulta.", "**Do I need to memorize all 23 patterns?** No. Knowing a dozen of the most used ones well and the intent of the rest is enough; the remainder can be looked up."],
        ["**Padrões servem em linguagens funcionais?** Os problemas permanecem, mas as soluções costumam ser mais leves, com funções e composição.", "**Do patterns apply to functional languages?** The problems remain, but solutions tend to be lighter, with functions and composition."],
        ["**Padrão é o mesmo que arquitetura?** Não. Padrões de projeto atuam na escala de classes; padrões arquiteturais (MVC, hexagonal, CQRS) atuam na escala de módulos e serviços.", "**Is a pattern the same as architecture?** No. Design patterns operate at the class scale; architectural patterns (MVC, hexagonal, CQRS) operate at the scale of modules and services."],
        ["**Existem padrões além do GoF?** Muitos: padrões de concorrência, de integração corporativa, de domínio (Repository, Unit of Work) e de nuvem (Circuit Breaker, Saga).", "**Are there patterns beyond the GoF?** Many: concurrency patterns, enterprise integration, domain (Repository, Unit of Work) and cloud (Circuit Breaker, Saga)."],
      ),
      tip(["Antes de adotar um padrão, escreva em uma frase o problema concreto que ele resolve no seu código. Se a frase soar forçada, deixe o padrão de fora.", "Before adopting a pattern, write in one sentence the concrete problem it solves in your code. If the sentence sounds forced, leave the pattern out."]),
    ] },
  { id: "padroes-de-projeto-estruturais", section: "lld", level: 1, icon: "device_hub", minutes: 11,
    title: ["Padrões estruturais: visão geral", "Structural patterns: overview"],
    summary: ["Como montar estruturas maiores a partir de classes e objetos: Adapter, Bridge, Composite, Decorator, Facade, Flyweight e Proxy.", "How to assemble larger structures from classes and objects: Adapter, Bridge, Composite, Decorator, Facade, Flyweight and Proxy."],
    body: [
      p(["Os padrões **estruturais** tratam de como classes e objetos se combinam para formar estruturas maiores, mantendo-as flexíveis e eficientes. Quase todos se apoiam na **composição**: em vez de herdar, um objeto contém outro e delega trabalho a ele. O que diferencia um padrão do outro não é o desenho de caixas (que costuma ser parecido), e sim a **intenção**: adaptar uma interface, adicionar comportamento, simplificar o acesso, controlar o acesso, tratar o todo e a parte de modo uniforme ou economizar memória. Este artigo apresenta os sete e aprofunda os que não têm artigo próprio: Bridge, Composite e Flyweight.", "**Structural** patterns deal with how classes and objects combine to form larger structures while keeping them flexible and efficient. Almost all rely on **composition**: instead of inheriting, an object holds another and delegates work to it. What sets one pattern apart from another is not the box drawing (which tends to look alike) but the **intent**: adapting an interface, adding behavior, simplifying access, controlling access, treating whole and part uniformly or saving memory. This article presents all seven and goes deep into those without their own article: Bridge, Composite and Flyweight."]),
      table([["Padrão", "Pattern"], ["Intenção em uma frase", "Intent in one sentence"], ["Diferença-chave", "Key difference"]],
        [["Adapter", "Adapter"], ["Converter a interface de uma classe na que o cliente espera", "Convert one class's interface into the one the client expects"], ["Muda a interface; o comportamento é o mesmo", "Changes the interface; behavior is the same"]],
        [["Bridge", "Bridge"], ["Separar abstração e implementação para variarem independentemente", "Separate abstraction and implementation so they vary independently"], ["Pensado antes, para evitar explosão de subclasses", "Planned upfront, to avoid subclass explosion"]],
        [["Composite", "Composite"], ["Tratar objeto individual e grupo de objetos pela mesma interface", "Treat an individual object and a group of objects through the same interface"], ["Estrutura em árvore todo-parte", "Whole-part tree structure"]],
        [["Decorator", "Decorator"], ["Acrescentar responsabilidades dinamicamente", "Add responsibilities dynamically"], ["Mesma interface; acrescenta comportamento", "Same interface; adds behavior"]],
        [["Facade", "Facade"], ["Oferecer uma interface simples a um subsistema complexo", "Offer a simple interface to a complex subsystem"], ["Cria uma interface nova e mais simples", "Creates a new, simpler interface"]],
        [["Flyweight", "Flyweight"], ["Compartilhar estado comum para suportar muitos objetos pequenos", "Share common state to support many small objects"], ["Foco em memória", "Memory-focused"]],
        [["Proxy", "Proxy"], ["Substituir um objeto para controlar o acesso a ele", "Stand in for an object to control access to it"], ["Mesma interface; controla o acesso", "Same interface; controls access"]],
      ),
      h(["Adapter", "Adapter"]),
      p(["Quando você precisa usar uma classe cuja interface não bate com a esperada (uma biblioteca de terceiros, um serviço legado), o **Adapter** a embrulha e traduz as chamadas. É o conversor de tomada do software: nada muda dentro, só o encaixe. É extremamente comum na fronteira com provedores externos, como pagamentos ou e-mail, e é a peça central de ports and adapters. Veja o artigo dedicado para o código completo, as versões por objeto e por classe e o uso em frameworks.", "When you need to use a class whose interface does not match the expected one (a third-party library, a legacy service), the **Adapter** wraps it and translates calls. It is the software power plug converter: nothing changes inside, only the fit. It is extremely common at the boundary with external providers, such as payments or email, and is the central piece of ports and adapters. See the dedicated article for complete code, the object and class versions and the use in frameworks."]),
      h(["Bridge", "Bridge"]),
      p(["O **Bridge** resolve a *explosão de subclasses* que ocorre quando uma classe varia em duas dimensões independentes. Imagine formas (círculo, quadrado) e cores (vermelho, azul): com herança, você teria `RedCircle`, `BlueCircle`, `RedSquare`, `BlueSquare`, e cada nova forma ou cor dobra o número de classes (M x N). No Bridge, a hierarquia da **abstração** (a forma) *tem uma* referência à hierarquia da **implementação** (a cor, ou uma API de desenho) e delega a ela. Passam a existir M + N classes e as duas hierarquias crescem separadamente. Um exemplo clássico é uma interface gráfica que desenha em várias plataformas: a abstração (`Window`, `Dialog`) usa um `Renderer` (Windows, Linux, Web) por baixo.", "**Bridge** solves the *subclass explosion* that occurs when a class varies in two independent dimensions. Imagine shapes (circle, square) and colors (red, blue): with inheritance you would have `RedCircle`, `BlueCircle`, `RedSquare`, `BlueSquare`, and each new shape or color doubles the number of classes (M x N). In Bridge, the **abstraction** hierarchy (the shape) *has a* reference to the **implementation** hierarchy (the color, or a drawing API) and delegates to it. M + N classes exist and the two hierarchies grow separately. A classic example is a graphical interface that draws on several platforms: the abstraction (`Window`, `Dialog`) uses a `Renderer` (Windows, Linux, Web) underneath."]),
      fig(["Bridge: duas hierarquias ligadas por composição", "Bridge: two hierarchies linked by composition"], [
        [node("sh", ["Shape (abstração)", "Shape (abstraction)"], "service")],
        [node("ci", "Circle", "data"), node("sq", "Square", "data")],
        [node("rd", ["Renderer (implementação)", "Renderer (implementation)"], "edge")],
        [node("svg", "SvgRenderer", "ext"), node("cv", "CanvasRenderer", "ext")],
      ], [edge("sh", "rd", ["tem um", "has a"]), edge("ci", "sh", "", { dashed: true }), edge("sq", "sh", "", { dashed: true }), edge("rd", "svg", "", { dashed: true }), edge("rd", "cv", "", { dashed: true })]),
      code(`interface Renderer { circle(x: number, y: number, r: number): string }
class SvgRenderer implements Renderer {
  circle(x: number, y: number, r: number) { return "<circle cx='" + x + "' cy='" + y + "' r='" + r + "'/>"; }
}
class AsciiRenderer implements Renderer {
  circle(x: number, y: number, r: number) { return "(circle at " + x + "," + y + " r=" + r + ")"; }
}
abstract class Shape {
  constructor(protected renderer: Renderer) {}    // the bridge
  abstract draw(): string;
}
class Circle extends Shape {
  constructor(renderer: Renderer, private x: number, private y: number, private r: number) { super(renderer); }
  draw() { return this.renderer.circle(this.x, this.y, this.r); }
}
console.log(new Circle(new SvgRenderer(), 1, 2, 3).draw());
console.log(new Circle(new AsciiRenderer(), 1, 2, 3).draw());`),
      p(["**Bridge x Adapter**: o Adapter é aplicado depois, para fazer interfaces existentes e incompatíveis funcionarem juntas; o Bridge é planejado desde o início para manter as duas partes variáveis. **Bridge x Strategy**: a estrutura é quase idêntica; o Strategy troca um algoritmo, enquanto o Bridge separa uma hierarquia de abstração de uma de implementação.", "**Bridge vs Adapter**: Adapter is applied afterward, to make existing incompatible interfaces work together; Bridge is planned from the start to keep both parts variable. **Bridge vs Strategy**: the structure is almost identical; Strategy swaps an algorithm, whereas Bridge separates an abstraction hierarchy from an implementation one."]),
      h(["Composite", "Composite"]),
      p(["O **Composite** organiza objetos em **árvores** em que folhas e galhos (grupos) compartilham a mesma interface. O cliente trata um arquivo e uma pasta, uma peça e uma caixa de peças, um botão e um painel, do mesmo modo: ao chamar a operação em um grupo, ele a repassa aos filhos e agrega o resultado. Sempre que o domínio tem uma estrutura *todo-parte* recursiva, Composite elimina `if (isGroup)` espalhados pelo código.", "**Composite** organizes objects into **trees** in which leaves and branches (groups) share the same interface. The client treats a file and a folder, a part and a box of parts, a button and a panel in the same way: when calling the operation on a group, it forwards it to the children and aggregates the result. Whenever the domain has a recursive *whole-part* structure, Composite removes `if (isGroup)` checks scattered through the code."]),
      fig(["Composite: pastas e arquivos", "Composite: folders and files"], [
        [node("cm", ["«interface» FsNode", "«interface» FsNode"], "edge")],
        [node("fi", "File", "data"), node("fo", "Folder", "service")],
      ], [edge("fi", "cm", "", { dashed: true }), edge("fo", "cm", "", { dashed: true }), edge("fo", "cm", ["contém *", "holds *"])]),
      code(`interface FsNode { name: string; size(): number }
class FileNode implements FsNode {
  constructor(readonly name: string, private bytes: number) {}
  size() { return this.bytes; }
}
class Folder implements FsNode {
  private children: FsNode[] = [];
  constructor(readonly name: string) {}
  add(n: FsNode) { this.children.push(n); return this; }
  size(): number { return this.children.reduce((sum, c) => sum + c.size(), 0); }   // recursion
}
const root = new Folder("root")
  .add(new FileNode("a.txt", 10))
  .add(new Folder("img").add(new FileNode("b.png", 200)).add(new FileNode("c.png", 300)));
console.log(root.size());   // 510`),
      p(["Decisão de design: onde declarar `add` e `remove`? Na interface comum, o cliente trata tudo igual, mas folhas passam a ter operações sem sentido (*transparência*). Só no composto, a interface fica mais segura, mas o cliente precisa saber distinguir (*segurança*). A maioria dos projetos escolhe a segunda opção. Usos reais: a árvore de componentes do DOM e do React, a hierarquia de views em interfaces gráficas, expressões aritméticas e sistemas de arquivos.", "Design decision: where to declare `add` and `remove`? On the common interface, the client treats everything the same, but leaves gain meaningless operations (*transparency*). Only on the composite, the interface is safer, but the client must know how to tell them apart (*safety*). Most projects choose the second. Real uses: the component tree of the DOM and React, view hierarchies in graphical interfaces, arithmetic expressions and file systems."]),
      h(["Decorator", "Decorator"]),
      p(["O **Decorator** acrescenta responsabilidades a um objeto em tempo de execução, embrulhando-o em outro que **tem a mesma interface**. Pode-se empilhar vários decoradores, combinando comportamentos sem criar uma subclasse para cada combinação. É a base de middlewares, compressão, criptografia, logging e cache em torno de um serviço. O artigo dedicado traz o código completo e a comparação com herança e com Proxy.", "**Decorator** adds responsibilities to an object at run time by wrapping it in another that **has the same interface**. Several decorators can be stacked, combining behaviors without creating a subclass for every combination. It is the basis of middlewares, compression, encryption, logging and caching around a service. The dedicated article brings complete code and the comparison with inheritance and with Proxy."]),
      h(["Facade e Proxy", "Facade and Proxy"]),
      p(["A **Facade** oferece uma interface simples e de alto nível a um conjunto de classes complexas, escondendo detalhes do subsistema (uma única chamada `video.convert(arquivo, formato)` por cima de codecs, buffers e contêineres). O **Proxy** é um substituto que controla o acesso a um objeto real: carregamento sob demanda (*virtual*), checagem de permissões (*proteção*), representação de um objeto remoto (*remoto*), cache ou registro. Há um artigo único para os dois, com código e a comparação entre eles.", "A **Facade** offers a simple, high-level interface to a set of complex classes, hiding subsystem details (a single `video.convert(file, format)` call on top of codecs, buffers and containers). A **Proxy** is a stand-in that controls access to a real object: lazy loading (*virtual*), permission checks (*protection*), representation of a remote object (*remote*), caching or logging. A single article covers both, with code and the comparison between them."]),
      h(["Flyweight", "Flyweight"]),
      p(["O **Flyweight** economiza memória quando há um número enorme de objetos parecidos, separando o estado em duas partes: o **intrínseco** (compartilhado, imutável, guardado dentro do flyweight) e o **extrínseco** (único de cada uso, passado como argumento). Em um editor de texto, em vez de um objeto por caractere com fonte, tamanho e glifo, existe um flyweight por *caractere e estilo*; a posição na página é extrínseca e fica no documento. Uma **fábrica de flyweights** garante o compartilhamento, devolvendo o mesmo objeto para a mesma chave. Os exemplos clássicos são florestas em jogos (milhares de árvores com a mesma malha e textura, com posição diferente) e o *string interning* de linguagens como Java.", "**Flyweight** saves memory when there is an enormous number of similar objects, splitting state into two parts: **intrinsic** (shared, immutable, kept inside the flyweight) and **extrinsic** (unique per use, passed as an argument). In a text editor, instead of one object per character with font, size and glyph, there is one flyweight per *character and style*; the position on the page is extrinsic and lives in the document. A **flyweight factory** ensures sharing by returning the same object for the same key. Classic examples are forests in games (thousands of trees with the same mesh and texture, with different positions) and the *string interning* of languages such as Java."]),
      code(`class TreeType {                                   // flyweight: intrinsic state, immutable
  constructor(readonly name: string, readonly color: string, readonly texture: string) {}
  draw(x: number, y: number) { return this.name + " at " + x + "," + y; }   // x,y are extrinsic
}
class TreeTypeFactory {
  private static cache = new Map<string, TreeType>();
  static get(name: string, color: string, texture: string): TreeType {
    const key = name + "|" + color + "|" + texture;
    let t = this.cache.get(key);
    if (!t) { t = new TreeType(name, color, texture); this.cache.set(key, t); }
    return t;
  }
}
class Tree { constructor(private x: number, private y: number, private type: TreeType) {} draw() { return this.type.draw(this.x, this.y); } }
const forest: Tree[] = [];
for (let i = 0; i < 100000; i++) forest.push(new Tree(i, i % 50, TreeTypeFactory.get("oak", "green", "oak.png")));
// 100000 Tree objects, but a single TreeType in memory`),
      h(["Quais estruturais usar em cada situação", "Which structural pattern to use in each situation"]),
      table([["Situação", "Situation"], ["Padrão provável", "Likely pattern"], ["Por quê", "Why"]],
        [["Integrar uma biblioteca com interface diferente", "Integrating a library with a different interface"], ["Adapter", "Adapter"], ["Traduz sem tocar na biblioteca", "Translates without touching the library"]],
        [["Duas dimensões de variação crescendo", "Two growing dimensions of variation"], ["Bridge", "Bridge"], ["Evita M x N subclasses", "Avoids M x N subclasses"]],
        [["Árvore de partes e todos", "Tree of parts and wholes"], ["Composite", "Composite"], ["Trata folha e grupo igual", "Treats leaf and group alike"]],
        [["Acrescentar logging, cache ou compressão sem mudar a classe", "Adding logging, cache or compression without changing the class"], ["Decorator", "Decorator"], ["Camadas empilháveis", "Stackable layers"]],
        [["Esconder um subsistema complicado", "Hiding a complicated subsystem"], ["Facade", "Facade"], ["Uma entrada simples", "A single simple entry"]],
        [["Milhões de objetos quase iguais", "Millions of nearly identical objects"], ["Flyweight", "Flyweight"], ["Compartilha o estado comum", "Shares the common state"]],
        [["Controlar acesso, carregar tardiamente, intermediar rede", "Controlling access, lazy loading, mediating network"], ["Proxy", "Proxy"], ["Mesmo contrato, acesso controlado", "Same contract, controlled access"]],
      ),
      h(["Vantagens, desvantagens e cuidados", "Advantages, disadvantages and cautions"]),
      ul(
        ["**Vantagens**: reduzem acoplamento a classes concretas, permitem combinar comportamentos em tempo de execução e favorecem o princípio aberto/fechado.", "**Advantages**: they reduce coupling to concrete classes, allow combining behaviors at run time and favor the open/closed principle."],
        ["**Desvantagens**: aumentam o número de classes e a indireção, e a depuração passa por várias camadas de objetos embrulhados.", "**Disadvantages**: they increase the number of classes and indirection, and debugging passes through several layers of wrapped objects."],
        ["**Cuidado com a semelhança**: Adapter, Decorator, Facade e Proxy embrulham outro objeto. A intenção é o que decide qual você está usando e ajuda a nomear as classes corretamente.", "**Beware of resemblance**: Adapter, Decorator, Facade and Proxy all wrap another object. Intent decides which one you are using and helps name classes correctly."],
        ["**Cuidado com a ordem** ao empilhar decoradores: comprimir antes ou depois de criptografar produz resultados muito diferentes.", "**Mind the order** when stacking decorators: compressing before or after encrypting produces very different results."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Os estruturais montam estruturas maiores por composição; o que os distingue é a intenção.", "Structural patterns assemble larger structures through composition; intent is what tells them apart."],
        ["Adapter muda a interface, Facade a simplifica, Proxy controla o acesso, Decorator acrescenta comportamento.", "Adapter changes the interface, Facade simplifies it, Proxy controls access, Decorator adds behavior."],
        ["Bridge separa duas hierarquias e evita explosão de subclasses; Composite trata o todo e a parte igualmente; Flyweight compartilha estado.", "Bridge separates two hierarchies and avoids subclass explosion; Composite treats whole and part equally; Flyweight shares state."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Qual a diferença entre Decorator e herança?** O Decorator compõe comportamentos em tempo de execução; a herança fixa a combinação em tempo de compilação e gera uma subclasse por combinação.", "**What is the difference between Decorator and inheritance?** Decorator composes behaviors at run time; inheritance fixes the combination at compile time and generates a subclass per combination."],
        ["**Facade impede o acesso ao subsistema?** Não necessariamente; ela só oferece um caminho simples, e quem precisa de controle fino ainda pode usar as classes internas.", "**Does a Facade prevent access to the subsystem?** Not necessarily; it only offers a simple path, and whoever needs fine control can still use the inner classes."],
        ["**Flyweight vale a pena em aplicações comuns?** Raramente. Só quando a medição mostra que o número de objetos pesa na memória.", "**Is Flyweight worth it in common applications?** Rarely. Only when measurement shows the number of objects weighs on memory."],
        ["**Composite exige recursão?** Normalmente sim, as operações do composto percorrem os filhos recursivamente; árvores muito profundas podem exigir iteração.", "**Does Composite require recursion?** Normally yes, composite operations traverse children recursively; very deep trees may require iteration."],
      ),
      tip(["Ao ver um objeto que embrulha outro, pergunte o que ele muda: a interface (Adapter), a simplicidade (Facade), o acesso (Proxy) ou o comportamento (Decorator). A resposta dá o nome do padrão.", "When you see an object wrapping another, ask what it changes: the interface (Adapter), the simplicity (Facade), the access (Proxy) or the behavior (Decorator). The answer gives the pattern's name."]),
    ] },
  { id: "padroes-de-projeto-comportamentais", section: "lld", level: 2, icon: "swap_horiz", minutes: 12,
    title: ["Padrões comportamentais: visão geral", "Behavioral patterns: overview"],
    summary: ["Como objetos se comunicam e dividem responsabilidades: Strategy, Observer, Command, State, Chain, Template Method, Iterator, Mediator, Memento, Visitor e Interpreter.", "How objects communicate and share responsibilities: Strategy, Observer, Command, State, Chain, Template Method, Iterator, Mediator, Memento, Visitor and Interpreter."],
    body: [
      p(["Os padrões **comportamentais** cuidam da *colaboração entre objetos*: como distribuir responsabilidades, como as mensagens circulam e como algoritmos são encapsulados. Eles são a maior família do catálogo GoF, com onze padrões, e talvez a mais útil no cotidiano, porque atacam diretamente o excesso de `if` e `switch`, o acoplamento entre emissores e receptores e a dificuldade de variar um comportamento sem mexer em quem o usa. Cinco deles têm artigo próprio (Strategy, Observer, Command, State e Chain of Responsibility); aqui você encontra o panorama completo e o aprofundamento nos demais.", "**Behavioral** patterns handle *collaboration between objects*: how to distribute responsibilities, how messages flow and how algorithms are encapsulated. They are the largest family in the GoF catalog, with eleven patterns, and perhaps the most useful day to day, since they directly attack excess `if` and `switch`, coupling between senders and receivers and the difficulty of varying a behavior without touching its users. Five of them have their own article (Strategy, Observer, Command, State and Chain of Responsibility); here you will find the complete overview and the deep dive into the rest."]),
      table([["Padrão", "Pattern"], ["Problema que resolve", "Problem it solves"], ["Ideia central", "Core idea"]],
        [["Strategy", "Strategy"], ["Vários algoritmos para a mesma tarefa, trocáveis", "Several algorithms for the same task, swappable"], ["Encapsule cada algoritmo atrás de uma interface", "Encapsulate each algorithm behind an interface"]],
        [["Observer", "Observer"], ["Avisar vários objetos quando um muda", "Notify several objects when one changes"], ["Assinatura e notificação, sem acoplar quem publica", "Subscribe and notify, without coupling the publisher"]],
        [["Command", "Command"], ["Tratar um pedido como objeto: enfileirar, registrar, desfazer", "Treat a request as an object: queue, log, undo"], ["Embrulhe a ação e seus parâmetros", "Wrap the action and its parameters"]],
        [["State", "State"], ["Comportamento que depende do estado atual", "Behavior that depends on current state"], ["Cada estado vira uma classe", "Each state becomes a class"]],
        [["Chain of Responsibility", "Chain of Responsibility"], ["Vários candidatos podem tratar um pedido", "Several candidates may handle a request"], ["Passe adiante até alguém tratar", "Pass along until someone handles it"]],
        [["Template Method", "Template Method"], ["Mesmo esqueleto de algoritmo, passos diferentes", "Same algorithm skeleton, different steps"], ["A base fixa a ordem; as filhas preenchem os passos", "The base fixes the order; children fill in the steps"]],
        [["Iterator", "Iterator"], ["Percorrer uma coleção sem expor sua estrutura", "Traverse a collection without exposing its structure"], ["Um objeto separado conduz o percurso", "A separate object drives the traversal"]],
        [["Mediator", "Mediator"], ["Muitos objetos conversando entre si formam uma teia", "Many objects talking to each other form a web"], ["Um intermediário centraliza a comunicação", "An intermediary centralizes communication"]],
        [["Memento", "Memento"], ["Salvar e restaurar o estado sem violar o encapsulamento", "Save and restore state without breaking encapsulation"], ["Um objeto-instantâneo opaco guarda o estado", "An opaque snapshot object holds the state"]],
        [["Visitor", "Visitor"], ["Nova operação sobre uma estrutura sem alterar suas classes", "New operation on a structure without changing its classes"], ["Separe a operação da estrutura de dados", "Separate the operation from the data structure"]],
        [["Interpreter", "Interpreter"], ["Avaliar sentenças de uma linguagem simples", "Evaluate sentences of a simple language"], ["Uma classe por regra da gramática", "One class per grammar rule"]],
      ),
      fig(["Quem se comunica com quem: três formas de coordenar objetos", "Who communicates with whom: three ways to coordinate objects"], [
        [node("subj", ["Observer: Subject", "Observer: Subject"], "service"), node("sender", ["Command: Invoker", "Command: Invoker"], "service"), node("colleague", ["Mediator: Colleagues", "Mediator: Colleagues"], "service")],
        [node("obs", ["Observers", "Observers"], "edge"), node("cmd", ["Command", "Command"], "edge"), node("med", ["Mediator", "Mediator"], "edge")],
        [node("obs2", ["reagem ao evento", "react to the event"], "data"), node("recv", "Receiver", "data"), node("others", ["outros colegas", "other colleagues"], "data")],
      ], [edge("subj", "obs", ["notifica", "notifies"]), edge("sender", "cmd", ["executa", "executes"]), edge("colleague", "med", ["pede", "asks"]), edge("obs", "obs2"), edge("cmd", "recv"), edge("med", "others")]),
      h(["Strategy, Observer, Command, State e Chain", "Strategy, Observer, Command, State and Chain"]),
      p(["Esses cinco aparecem em quase todo sistema real e ganham artigos completos. Em uma linha: **Strategy** troca o algoritmo; **Observer** propaga eventos a quem se interessou; **Command** transforma uma ação em objeto para fila, histórico e desfazer; **State** muda o comportamento de um objeto conforme seu estado; **Chain of Responsibility** passa um pedido por uma cadeia de handlers, como os middlewares de um servidor web.", "These five appear in nearly every real system and get complete articles. In one line: **Strategy** swaps the algorithm; **Observer** propagates events to whoever is interested; **Command** turns an action into an object for queueing, history and undo; **State** changes an object's behavior according to its state; **Chain of Responsibility** passes a request through a chain of handlers, like a web server's middlewares."]),
      h(["Template Method", "Template Method"]),
      p(["O **Template Method** define, em uma classe base, o **esqueleto de um algoritmo** (a ordem dos passos) e deixa que subclasses preencham passos específicos, sem alterar a estrutura. É a inversão de controle por herança, descrita pelo *Princípio de Hollywood*: *não nos chame, nós chamamos você*. A base chama os ganchos que as filhas implementam. Há passos *abstratos* (obrigatórios) e *ganchos* (hooks), com implementação padrão vazia, que as filhas podem sobrescrever se quiserem.", "**Template Method** defines, in a base class, the **skeleton of an algorithm** (the order of steps) and lets subclasses fill in specific steps without changing the structure. It is inversion of control through inheritance, described by the *Hollywood Principle*: *don't call us, we'll call you*. The base calls the hooks that children implement. There are *abstract* steps (mandatory) and *hooks* with an empty default implementation, which children can override if they wish."]),
      code(`abstract class DataExporter {
  // the template method: fixed order, not meant to be overridden
  export(): string {
    const rows = this.fetch();
    const filtered = this.filter(rows);          // hook with default
    return this.header() + this.format(filtered) + this.footer();
  }
  protected abstract fetch(): string[][];        // mandatory step
  protected abstract format(rows: string[][]): string;
  protected filter(rows: string[][]) { return rows; }       // optional hook
  protected header() { return ""; }
  protected footer() { return ""; }
}
class CsvExporter extends DataExporter {
  protected fetch() { return [["id", "name"], ["1", "Ana"]]; }
  protected format(rows: string[][]) { return rows.map((r) => r.join(",")).join("\\n"); }
}
class HtmlExporter extends DataExporter {
  protected fetch() { return [["id", "name"], ["1", "Ana"]]; }
  protected header() { return "<table>"; }
  protected footer() { return "</table>"; }
  protected format(rows: string[][]) { return rows.map((r) => "<tr>" + r.map((c) => "<td>" + c + "</td>").join("") + "</tr>").join(""); }
}`),
      p(["Use quando vários algoritmos compartilham a mesma sequência e só uns poucos passos variam; evite quando a herança vira um impedimento, pois o Template Method acopla as filhas à base. Frameworks usam muito: `HttpServlet` (`doGet`, `doPost`), o ciclo de vida dos componentes e classes base de testes (`setUp`, `tearDown`). Se o algoritmo muda mais em tempo de execução do que em tempo de projeto, **Strategy** (composição) é preferível.", "Use it when several algorithms share the same sequence and only a few steps vary; avoid it when inheritance becomes an obstacle, since Template Method couples the children to the base. Frameworks use it a lot: `HttpServlet` (`doGet`, `doPost`), component lifecycles and test base classes (`setUp`, `tearDown`). If the algorithm changes more at run time than at design time, **Strategy** (composition) is preferable."]),
      h(["Iterator", "Iterator"]),
      p(["O **Iterator** fornece um modo de percorrer os elementos de uma coleção em sequência **sem expor sua representação interna** (lista, árvore, tabela hash). A coleção entrega um objeto com `next()` e a informação de fim, e o cliente não sabe como a estrutura está organizada; é possível ter vários percursos simultâneos e diferentes (em ordem, reverso, em largura). Na maioria das linguagens modernas o padrão já vem embutido: `Iterator` e `for-each` em Java, `IEnumerable` em C#, o protocolo `Symbol.iterator` e os geradores em JavaScript e TypeScript, `__iter__` em Python.", "**Iterator** provides a way to traverse a collection's elements in sequence **without exposing its internal representation** (list, tree, hash table). The collection hands out an object with `next()` and the end information, and the client does not know how the structure is organized; several simultaneous and different traversals are possible (in order, reverse, breadth-first). In most modern languages the pattern is built in: `Iterator` and `for-each` in Java, `IEnumerable` in C#, the `Symbol.iterator` protocol and generators in JavaScript and TypeScript, `__iter__` in Python."]),
      code(`class Tree<T> {
  constructor(public value: T, public children: Tree<T>[] = []) {}
  // depth-first traversal as a generator: hides the structure
  *[Symbol.iterator](): Iterator<T> {
    yield this.value;
    for (const c of this.children) yield* c;
  }
  *breadthFirst(): Generator<T> {
    const queue: Tree<T>[] = [this];
    while (queue.length) { const n = queue.shift()!; yield n.value; queue.push(...n.children); }
  }
}
const t = new Tree(1, [new Tree(2, [new Tree(4)]), new Tree(3)]);
console.log([...t]);                  // [1, 2, 4, 3]
console.log([...t.breadthFirst()]);   // [1, 2, 3, 4]`),
      h(["Mediator", "Mediator"]),
      p(["Quando muitos objetos se comunicam diretamente, o número de ligações cresce de forma quase quadrática e cada mudança afeta vários vizinhos. O **Mediator** centraliza essa conversa: os objetos (*colegas*) só conhecem o mediador, e ele decide quem deve reagir. Isso troca a teia de dependências por uma estrela. Exemplos: o controlador de tráfego aéreo, que evita que aviões conversem entre si; uma sala de chat em que as mensagens passam pelo servidor; um formulário em que o mediador habilita o botão Enviar quando todos os campos são válidos. O custo é o risco de o mediador virar um *objeto-deus* que concentra lógica demais.", "When many objects communicate directly, the number of links grows almost quadratically and each change affects several neighbors. **Mediator** centralizes that conversation: the objects (*colleagues*) only know the mediator, and it decides who must react. This swaps the web of dependencies for a star. Examples: the air traffic controller, which prevents airplanes from talking to each other; a chat room where messages pass through the server; a form where the mediator enables the Submit button when all fields are valid. The cost is the risk that the mediator becomes a *god object* concentrating too much logic."]),
      code(`interface FormMediator { changed(source: string): void }
class SignupForm implements FormMediator {
  email = ""; password = ""; submitEnabled = false;
  changed(source: string) {
    // single place with the cross-field rule
    this.submitEnabled = this.email.includes("@") && this.password.length >= 8;
  }
}
class Field {
  constructor(private name: string, private mediator: FormMediator, private set: (v: string) => void) {}
  input(value: string) { this.set(value); this.mediator.changed(this.name); }   // knows only the mediator
}
const form = new SignupForm();
new Field("email", form, (v) => (form.email = v)).input("a@b.com");
new Field("password", form, (v) => (form.password = v)).input("12345678");
console.log(form.submitEnabled);   // true`),
      h(["Memento", "Memento"]),
      p(["O **Memento** captura e externaliza o estado interno de um objeto para que ele possa ser restaurado depois, **sem violar o encapsulamento**. Três papéis: o **Originator** (o objeto cujo estado é salvo, e que cria e consome o memento), o **Memento** (um instantâneo opaco, imutável) e o **Caretaker** (guarda a pilha de mementos, sem olhar dentro). É a base de desfazer em editores, de *checkpoints* em jogos e de transações simples em memória. O custo é a memória: guardar instantâneos completos de objetos grandes pode ser caro, e uma alternativa é salvar só as diferenças (deltas) ou combinar com Command.", "**Memento** captures and externalizes an object's internal state so it can be restored later, **without violating encapsulation**. Three roles: the **Originator** (the object whose state is saved, and which creates and consumes the memento), the **Memento** (an opaque, immutable snapshot) and the **Caretaker** (keeps the stack of mementos without looking inside). It is the basis of undo in editors, *checkpoints* in games and simple in-memory transactions. The cost is memory: keeping complete snapshots of large objects can be expensive, and an alternative is saving only differences (deltas) or combining with Command."]),
      code(`class Snapshot { constructor(readonly text: string, readonly cursor: number) {} }   // opaque to the caretaker
class Editor {
  private text = ""; private cursor = 0;
  type(s: string) { this.text += s; this.cursor = this.text.length; }
  save(): Snapshot { return new Snapshot(this.text, this.cursor); }
  restore(s: Snapshot) { this.text = s.text; this.cursor = s.cursor; }
  get content() { return this.text; }
}
class History {
  private stack: Snapshot[] = [];
  push(s: Snapshot) { this.stack.push(s); }
  pop() { return this.stack.pop(); }
}
const ed = new Editor(); const hist = new History();
ed.type("Hello"); hist.push(ed.save());
ed.type(" world");
const prev = hist.pop(); if (prev) ed.restore(prev);   // content is "Hello" again`),
      h(["Visitor", "Visitor"]),
      p(["O **Visitor** permite adicionar novas operações a uma estrutura de objetos **sem alterar as classes** dos elementos. Cada elemento aceita um visitante (`accept(v)`) e chama o método do visitante correspondente ao seu tipo (`v.visitCircle(this)`), técnica chamada *despacho duplo*. É útil quando a estrutura é estável (uma árvore sintática, formas) mas as operações sobre ela mudam muito (exportar, calcular área, renderizar, otimizar). O ponto fraco é o inverso: adicionar um novo tipo de elemento obriga a alterar todos os visitantes. Em linguagens com uniões discriminadas e `switch` exaustivo (TypeScript, Rust), esse padrão frequentemente é substituído por correspondência de padrões.", "**Visitor** lets you add new operations to an object structure **without changing the classes** of its elements. Each element accepts a visitor (`accept(v)`) and calls the visitor method corresponding to its type (`v.visitCircle(this)`), a technique called *double dispatch*. It is useful when the structure is stable (a syntax tree, shapes) but the operations on it change a lot (export, compute area, render, optimize). The weak point is the reverse: adding a new element type forces changes to all visitors. In languages with discriminated unions and exhaustive `switch` (TypeScript, Rust), this pattern is often replaced by pattern matching."]),
      code(`interface ShapeVisitor<R> { circle(c: Circle): R; rect(r: Rect): R }
interface VShape { accept<R>(v: ShapeVisitor<R>): R }
class Circle implements VShape { constructor(readonly r: number) {} accept<R>(v: ShapeVisitor<R>) { return v.circle(this); } }
class Rect implements VShape { constructor(readonly w: number, readonly h: number) {} accept<R>(v: ShapeVisitor<R>) { return v.rect(this); } }

const area: ShapeVisitor<number> = {            // new operation, no change in shape classes
  circle: (c) => Math.PI * c.r ** 2,
  rect: (r) => r.w * r.h,
};
const svg: ShapeVisitor<string> = {
  circle: (c) => "<circle r='" + c.r + "'/>",
  rect: (r) => "<rect width='" + r.w + "' height='" + r.h + "'/>",
};
const shapes: VShape[] = [new Circle(1), new Rect(2, 3)];
console.log(shapes.map((s) => s.accept(area)));`),
      h(["Interpreter", "Interpreter"]),
      p(["O **Interpreter** representa as regras de uma linguagem simples como uma hierarquia de classes, uma por símbolo da gramática, e avalia sentenças percorrendo a árvore resultante (em geral um Composite). Faz sentido para linguagens pequenas e estáveis: expressões de filtro, regras de desconto, buscas, expressões regulares simples. Para linguagens grandes, é melhor usar geradores de analisadores. Na prática, quase toda calculadora de expressões, motor de regras ou linguagem de consulta embutida tem um interpretador dentro.", "**Interpreter** represents the rules of a simple language as a class hierarchy, one per grammar symbol, and evaluates sentences by traversing the resulting tree (usually a Composite). It makes sense for small, stable languages: filter expressions, discount rules, searches, simple regular expressions. For large languages it is better to use parser generators. In practice, nearly every expression calculator, rules engine or embedded query language has an interpreter inside."]),
      code(`interface Expr { eval(vars: Record<string, number>): number }
class Num implements Expr { constructor(private n: number) {} eval() { return this.n; } }
class Var implements Expr { constructor(private name: string) {} eval(v: Record<string, number>) { return v[this.name]; } }
class Add implements Expr { constructor(private a: Expr, private b: Expr) {} eval(v: Record<string, number>) { return this.a.eval(v) + this.b.eval(v); } }
class Mul implements Expr { constructor(private a: Expr, private b: Expr) {} eval(v: Record<string, number>) { return this.a.eval(v) * this.b.eval(v); } }
// (x + 2) * 3
const e = new Mul(new Add(new Var("x"), new Num(2)), new Num(3));
console.log(e.eval({ x: 4 }));   // 18`),
      h(["Como distinguir padrões parecidos", "Telling similar patterns apart"]),
      table([["Comparação", "Comparison"], ["Diferença de intenção", "Difference in intent"]],
        [["Strategy x State", "Strategy vs State"], ["Strategy: o cliente escolhe o algoritmo. State: o próprio objeto troca de comportamento conforme transições internas.", "Strategy: the client chooses the algorithm. State: the object itself switches behavior according to internal transitions."]],
        [["Strategy x Template Method", "Strategy vs Template Method"], ["Strategy varia o algoritmo inteiro por composição; Template Method varia passos por herança.", "Strategy varies the whole algorithm by composition; Template Method varies steps by inheritance."]],
        [["Observer x Mediator", "Observer vs Mediator"], ["Observer é difusão de um para muitos; Mediator coordena conversas de muitos para muitos com lógica central.", "Observer is one-to-many broadcast; Mediator coordinates many-to-many conversations with central logic."]],
        [["Command x Strategy", "Command vs Strategy"], ["Command encapsula um pedido (o que fazer, com quais dados, talvez desfazer); Strategy encapsula um jeito de calcular.", "Command encapsulates a request (what to do, with which data, maybe undo); Strategy encapsulates a way of computing."]],
        [["Chain x Decorator", "Chain vs Decorator"], ["Na cadeia um handler pode interromper e responder; o decorador sempre repassa e acrescenta.", "In a chain a handler can stop and respond; a decorator always forwards and adds."]],
      ),
      h(["Vantagens e desvantagens da família", "Advantages and disadvantages of the family"]),
      ul(
        ["**Vantagens**: removem condicionais gigantes, desacoplam quem pede de quem faz, permitem trocar comportamento em tempo de execução e ajudam a testar cada peça isolada.", "**Advantages**: they remove giant conditionals, decouple who asks from who does, allow swapping behavior at run time and help test each piece in isolation."],
        ["**Desvantagens**: espalham a lógica por muitas classes pequenas; o fluxo de execução fica indireto, o que complica a leitura e a depuração; e, em linguagens com funções de primeira classe, parte delas pode ser substituída por callbacks e lambdas.", "**Disadvantages**: they scatter logic across many small classes; the execution flow becomes indirect, complicating reading and debugging; and, in languages with first-class functions, some of them can be replaced by callbacks and lambdas."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Os comportamentais organizam colaboração, responsabilidade e comunicação entre objetos.", "Behavioral patterns organize collaboration, responsibility and communication between objects."],
        ["Strategy, Observer, Command, State e Chain têm artigos próprios; os demais são Template Method, Iterator, Mediator, Memento, Visitor e Interpreter.", "Strategy, Observer, Command, State and Chain have their own articles; the others are Template Method, Iterator, Mediator, Memento, Visitor and Interpreter."],
        ["Template Method fixa o esqueleto por herança; Iterator esconde a estrutura da coleção; Mediator centraliza a conversa; Memento salva o estado; Visitor adiciona operações; Interpreter avalia uma gramática.", "Template Method fixes the skeleton by inheritance; Iterator hides the collection's structure; Mediator centralizes conversation; Memento saves state; Visitor adds operations; Interpreter evaluates a grammar."],
        ["Diferencie padrões parecidos pela intenção, e prefira funções simples quando a linguagem permitir.", "Tell similar patterns apart by intent, and prefer simple functions when the language allows."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Quais comportamentais são mais usados?** Strategy, Observer, Command, State e Iterator aparecem em quase todos os projetos, muitas vezes embutidos na linguagem ou no framework.", "**Which behavioral patterns are most used?** Strategy, Observer, Command, State and Iterator appear in nearly all projects, often built into the language or framework."],
        ["**Visitor ainda vale a pena?** Em linguagens sem correspondência de padrões, sim, para estruturas estáveis. Com uniões e `switch` exaustivo, costuma-se preferir esse caminho.", "**Is Visitor still worth it?** In languages without pattern matching, yes, for stable structures. With unions and exhaustive `switch`, that route is usually preferred."],
        ["**Mediator e Observer podem coexistir?** Sim: um mediador pode usar Observer para ser avisado pelos colegas.", "**Can Mediator and Observer coexist?** Yes: a mediator can use Observer to be notified by its colleagues."],
        ["**Template Method fere a composição sobre herança?** Ele usa herança de propósito. Se precisar variar em tempo de execução, troque por Strategy.", "**Does Template Method go against composition over inheritance?** It uses inheritance on purpose. If you need to vary at run time, switch to Strategy."],
      ),
      tip(["Se um padrão comportamental exigir cinco classes para economizar três linhas de `if`, a conta não fecha. Aplique quando houver pelo menos duas variantes reais e a perspectiva de uma terceira.", "If a behavioral pattern requires five classes to save three lines of `if`, the math does not work. Apply it when there are at least two real variants and the prospect of a third."]),
    ] },
  { id: "padrao-singleton", section: "lld", level: 1, icon: "filter_1", minutes: 10,
    title: ["Padrão Singleton", "Singleton pattern"],
    summary: ["Uma única instância com acesso global: implementações, concorrência, críticas e alternativas melhores.", "A single instance with global access: implementations, concurrency, criticism and better alternatives."],
    body: [
      p(["Alguns recursos só fazem sentido em uma única cópia por processo: o objeto que lê a configuração da aplicação, o registro de logs, um *pool* de conexões, um cache em memória, um gerenciador de dispositivos. Se cada trecho do código criasse a sua própria instância, haveria arquivos lidos várias vezes, conexões demais abertas e estados divergentes. O padrão **Singleton** (criacional, do catálogo GoF) garante que uma classe tenha **uma única instância** e fornece **um ponto de acesso global** a ela.", "Some resources only make sense as a single copy per process: the object that reads application configuration, the log registry, a connection *pool*, an in-memory cache, a device manager. If each piece of code created its own instance, files would be read several times, too many connections would be opened and state would diverge. The **Singleton** pattern (creational, from the GoF catalog) guarantees that a class has **a single instance** and provides **a global access point** to it."]),
      h(["Estrutura", "Structure"]),
      p(["A receita tem três ingredientes: um **construtor privado** (ninguém mais pode fazer `new`), um **campo estático** que guarda a instância e um **método estático** (`getInstance()`) que devolve a instância, criando-a na primeira chamada.", "The recipe has three ingredients: a **private constructor** (nobody else can call `new`), a **static field** holding the instance and a **static method** (`getInstance()`) that returns the instance, creating it on first call."]),
      fig(["Estrutura do Singleton", "Singleton structure"], [
        [node("c1", ["Cliente A", "Client A"], "client"), node("c2", ["Cliente B", "Client B"], "client"), node("c3", ["Cliente C", "Client C"], "client")],
        [node("gi", "getInstance()", "edge")],
        [node("si", "Singleton", "service")],
        [node("res", ["Recurso único", "Single resource"], "data")],
      ], [edge("c1", "gi"), edge("c2", "gi"), edge("c3", "gi"), edge("gi", "si", ["mesma instância", "same instance"]), edge("si", "res")]),
      h(["Implementação básica em TypeScript", "Basic implementation in TypeScript"]),
      code(`class Config {
  private static instance: Config | undefined;
  private readonly values = new Map<string, string>();

  private constructor() {                       // nobody outside can instantiate
    // expensive work happens once
    this.values.set("env", process.env.NODE_ENV ?? "development");
  }

  static getInstance(): Config {
    if (!Config.instance) Config.instance = new Config();   // lazy initialization
    return Config.instance;
  }

  get(key: string): string | undefined { return this.values.get(key); }
}

const a = Config.getInstance();
const b = Config.getInstance();
console.log(a === b);                            // true`),
      p(["Essa versão usa **inicialização preguiçosa** (*lazy*): a instância só nasce quando alguém a pede pela primeira vez. A alternativa é a **inicialização ansiosa** (*eager*), em que a instância é criada no carregamento da classe: é mais simples e naturalmente segura em concorrência, ao custo de criar o objeto mesmo se ninguém o usar.", "This version uses **lazy initialization**: the instance is only born when someone asks for it for the first time. The alternative is **eager initialization**, in which the instance is created when the class loads: it is simpler and naturally safe under concurrency, at the cost of creating the object even if nobody uses it."]),
      h(["Singleton e concorrência", "Singleton and concurrency"]),
      p(["Em linguagens com múltiplas threads (Java, C#, Go, C++), a versão preguiçosa acima tem uma **condição de corrida**: duas threads podem ver `instance` vazio ao mesmo tempo e criar duas instâncias. Soluções clássicas:", "In languages with multiple threads (Java, C#, Go, C++), the lazy version above has a **race condition**: two threads can see `instance` empty at the same time and create two instances. Classic solutions:"]),
      table([["Técnica", "Technique"], ["Como funciona", "How it works"], ["Observação", "Note"]],
        [["Inicialização ansiosa", "Eager initialization"], ["`static final INSTANCE = new X()`; o carregador de classes garante segurança", "`static final INSTANCE = new X()`; the class loader guarantees safety"], ["Mais simples; cria mesmo sem uso", "Simplest; creates even if unused"]],
        [["Método sincronizado", "Synchronized method"], ["Trava toda chamada a `getInstance()`", "Locks every call to `getInstance()`"], ["Correto, mas lento por travar sempre", "Correct, but slow because it always locks"]],
        [["Double-checked locking", "Double-checked locking"], ["Verifica, trava e verifica de novo; exige `volatile` em Java", "Checks, locks and checks again; requires `volatile` in Java"], ["Rápido, mas fácil de errar", "Fast, but easy to get wrong"]],
        [["Holder idiom (Java)", "Holder idiom (Java)"], ["Classe interna estática carrega a instância sob demanda", "A static inner class loads the instance on demand"], ["Preguiçoso e seguro sem travas explícitas", "Lazy and safe without explicit locks"]],
        [["Enum com um elemento (Java)", "Single-element enum (Java)"], ["`enum Singleton { INSTANCE }`", "`enum Singleton { INSTANCE }`"], ["Seguro, também contra serialização e reflexão", "Safe, including against serialization and reflection"]],
        [["`sync.Once` (Go)", "`sync.Once` (Go)"], ["Executa a inicialização exatamente uma vez", "Runs initialization exactly once"], ["Forma idiomática em Go", "Idiomatic way in Go"]],
      ),
      code(`// Java: double-checked locking (note volatile)
public final class Registry {
    private static volatile Registry instance;
    private Registry() {}
    public static Registry getInstance() {
        Registry local = instance;
        if (local == null) {
            synchronized (Registry.class) {
                local = instance;
                if (local == null) instance = local = new Registry();
            }
        }
        return local;
    }
}
// Java: the enum version (preferred when no inheritance is needed)
public enum Clock { INSTANCE; public long now() { return System.currentTimeMillis(); } }`),
      p(["Em JavaScript e TypeScript, o ambiente é de thread única por contexto, então a condição de corrida clássica não existe. Além disso, **módulos são singletons por natureza**: o código de um módulo roda uma vez e o resultado é cacheado, então exportar uma instância (`export const config = new Config()`) é a forma mais natural. Cuidado apenas com ambientes em que o mesmo módulo pode ser carregado duas vezes (múltiplos bundles, *workers*, recarga a quente em desenvolvimento).", "In JavaScript and TypeScript the environment is single-threaded per context, so the classic race condition does not exist. In addition, **modules are singletons by nature**: a module's code runs once and the result is cached, so exporting an instance (`export const config = new Config()`) is the most natural form. Just beware of environments where the same module may be loaded twice (multiple bundles, *workers*, hot reload in development)."]),
      code(`// TypeScript idiom: the module is the singleton
// logger.ts
class Logger {
  private lines: string[] = [];
  log(msg: string) { this.lines.push(new Date().toISOString() + " " + msg); }
  dump() { return this.lines.join("\\n"); }
}
export const logger = new Logger();   // every importer gets the same object`),
      h(["Variações", "Variations"]),
      ul(
        ["**Singleton por contêiner (escopo singleton)**: o framework de DI (Spring, NestJS, .NET) cria uma única instância por contêiner e a injeta onde necessário. É o uso mais saudável: o benefício de ter uma só instância sem o acesso global.", "**Container-scoped singleton (singleton scope)**: the DI framework (Spring, NestJS, .NET) creates a single instance per container and injects it where needed. It is the healthiest use: the benefit of a single instance without global access."],
        ["**Singleton por chave (Multiton)**: um mapa de instâncias nomeadas, por exemplo uma conexão por banco de dados.", "**Keyed singleton (Multiton)**: a map of named instances, for example one connection per database."],
        ["**Singleton por thread ou por requisição**: uma instância por contexto, usada para guardar identidade da requisição.", "**Per-thread or per-request singleton**: one instance per context, used to keep request identity."],
        ["**Registro de serviços (service locator)**: parente próximo, em que um registro global entrega instâncias; sofre das mesmas críticas.", "**Service registry (service locator)**: a close relative, in which a global registry hands out instances; suffers from the same criticism."],
      ),
      h(["Por que o Singleton é controverso", "Why Singleton is controversial"]),
      p(["O Singleton é muitas vezes chamado de *anti-padrão*, não porque ter uma instância seja ruim, mas por causa do **acesso global** que ele traz. Os problemas principais:", "Singleton is often called an *anti-pattern*, not because having one instance is bad, but because of the **global access** it brings. The main problems:"]),
      ul(
        ["**Dependências escondidas**: olhando a assinatura de um método, você não vê que ele usa `Config.getInstance()` por dentro. O código fica mais difícil de entender.", "**Hidden dependencies**: looking at a method's signature, you cannot see that it uses `Config.getInstance()` inside. The code becomes harder to understand."],
        ["**Testes difíceis**: o estado do singleton sobrevive entre testes, que passam a afetar uns aos outros; e não dá para substituí-lo por um dublê sem truques.", "**Hard tests**: the singleton's state survives across tests, which start affecting each other; and it cannot be replaced by a double without tricks."],
        ["**Acoplamento forte** à classe concreta, o que viola o princípio de inversão de dependência.", "**Strong coupling** to the concrete class, violating the dependency inversion principle."],
        ["**Violação do SRP**: a classe cuida da lógica de negócio *e* do controle do próprio ciclo de vida.", "**SRP violation**: the class handles business logic *and* control of its own lifecycle."],
        ["**Estado global mutável**: qualquer parte do programa pode alterá-lo, e rastrear bugs vira investigação.", "**Mutable global state**: any part of the program can change it, and tracking down bugs becomes an investigation."],
        ["**Problemas em ambientes distribuídos**: um singleton é único *por processo*; com várias instâncias do serviço, cada uma tem o seu. Se a unicidade for requisito do negócio (um único agendador), é preciso lock distribuído ou eleição de líder.", "**Problems in distributed environments**: a singleton is unique *per process*; with several service instances, each one has its own. If uniqueness is a business requirement (a single scheduler), you need a distributed lock or leader election."],
      ),
      h(["Alternativa recomendada: instância única injetada", "Recommended alternative: injected single instance"]),
      p(["A solução costuma ser separar as duas preocupações: *garantir que há uma instância* (responsabilidade do composition root ou do contêiner de DI) e *usar a instância* (responsabilidade do cliente, que a recebe pelo construtor). A classe deixa de ter construtor privado e método estático; ela é uma classe comum. Assim, o benefício é mantido e os problemas somem: testes passam um dublê, e a dependência fica visível.", "The solution is usually to separate the two concerns: *ensuring there is one instance* (the responsibility of the composition root or DI container) and *using the instance* (the responsibility of the client, which receives it via the constructor). The class no longer has a private constructor and static method; it is an ordinary class. The benefit is kept and the problems vanish: tests pass a double, and the dependency becomes visible."]),
      code(`interface Clock { now(): Date }
class SystemClock implements Clock { now() { return new Date(); } }
class FixedClock implements Clock { constructor(private d: Date) {} now() { return this.d; } }

class InvoiceService {
  constructor(private readonly clock: Clock) {}      // dependency is visible
  issue() { return { issuedAt: this.clock.now() }; }
}
// composition root: creates ONE SystemClock and shares it
const clock = new SystemClock();
const invoices = new InvoiceService(clock);
// test: new InvoiceService(new FixedClock(new Date("2025-01-01")))`),
      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      table([["Use quando", "Use when"], ["Evite quando", "Avoid when"]],
        [["Há de fato um recurso único por processo (log, configuração somente leitura, relógio do sistema)", "There is truly a single resource per process (log, read-only configuration, system clock)"], ["A classe guarda estado mutável de negócio que vários módulos alteram", "The class keeps mutable business state altered by several modules"]],
        [["A criação é cara e o objeto é imutável e seguro para compartilhar", "Creation is costly and the object is immutable and safe to share"], ["Você precisa de testes de unidade isolados e de dublês", "You need isolated unit tests and doubles"]],
        [["O contêiner de DI do framework gerencia a unicidade", "The framework's DI container manages uniqueness"], ["O sistema roda em várias instâncias e a unicidade é global ao negócio", "The system runs in several instances and uniqueness is global to the business"]],
      ),
      h(["Uso real em frameworks e bibliotecas", "Real use in frameworks and libraries"]),
      ul(
        ["**Java**: `Runtime.getRuntime()` e `Desktop.getDesktop()` devolvem instâncias únicas; beans do Spring têm escopo singleton por padrão (um por contêiner).", "**Java**: `Runtime.getRuntime()` and `Desktop.getDesktop()` return single instances; Spring beans have singleton scope by default (one per container)."],
        ["**Node.js**: módulos cacheados, como o cliente de banco exportado de um arquivo, funcionam como singletons.", "**Node.js**: cached modules, such as the database client exported from a file, work as singletons."],
        ["**Angular**: serviços com `providedIn: 'root'` são instâncias únicas por injetor raiz.", "**Angular**: services with `providedIn: 'root'` are single instances per root injector."],
        ["**Loggers**: bibliotecas como SLF4J e `logging` do Python entregam o mesmo logger para o mesmo nome (um multiton).", "**Loggers**: libraries such as SLF4J and Python's `logging` hand out the same logger for the same name (a multiton)."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Usar o Singleton para guardar *tudo* que precisa ser compartilhado, virando um balde de variáveis globais.", "Using Singleton to hold *everything* that needs to be shared, turning it into a bucket of global variables."],
        ["Esquecer a segurança de threads na versão preguiçosa em linguagens concorrentes.", "Forgetting thread safety in the lazy version in concurrent languages."],
        ["Esquecer que serialização, clonagem e reflexão podem criar uma segunda instância (em Java, por isso o enum é recomendado).", "Forgetting that serialization, cloning and reflection can create a second instance (in Java, which is why the enum is recommended)."],
        ["Assumir unicidade em um sistema distribuído: cada processo terá o seu singleton.", "Assuming uniqueness in a distributed system: each process will have its own singleton."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Singleton garante uma instância e acesso global por meio de construtor privado e método estático.", "Singleton guarantees one instance and global access through a private constructor and a static method."],
        ["Em linguagens concorrentes, proteja a criação (inicialização ansiosa, holder, enum, `sync.Once`).", "In concurrent languages, protect creation (eager initialization, holder, enum, `sync.Once`)."],
        ["Em TypeScript, o módulo já é um singleton; em frameworks, use o escopo singleton do contêiner.", "In TypeScript the module is already a singleton; in frameworks, use the container's singleton scope."],
        ["Prefira uma instância única injetada ao acesso global estático para manter o código testável.", "Prefer an injected single instance over static global access to keep the code testable."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Singleton é um anti-padrão?** Depende do uso. O acesso global estático costuma causar problemas; ter uma instância compartilhada e injetada é saudável.", "**Is Singleton an anti-pattern?** It depends on the use. Static global access tends to cause problems; having a shared, injected instance is healthy."],
        ["**Como testar código que usa um Singleton?** Extraia uma interface e injete a dependência; se não for possível, exponha um método de reset apenas para testes.", "**How do you test code that uses a Singleton?** Extract an interface and inject the dependency; if not possible, expose a reset method for tests only."],
        ["**Singleton é o mesmo que variável global?** É parecido, mas com controle de criação e possibilidade de inicialização preguiçosa. Os riscos de estado global permanecem.", "**Is Singleton the same as a global variable?** Similar, but with creation control and the possibility of lazy initialization. The risks of global state remain."],
        ["**Posso ter um Singleton com parâmetros?** Pode, mas é um sinal de alerta: os parâmetros só valem na primeira chamada. Prefira criar a instância no composition root.", "**Can I have a Singleton with parameters?** You can, but it is a warning sign: the parameters only count on the first call. Prefer creating the instance in the composition root."],
      ),
      tip(["Pergunta-teste: *preciso que exista uma só instância* ou *preciso que todo mundo alcance a instância de qualquer lugar*? A primeira é uma decisão de ciclo de vida, que um contêiner resolve; a segunda é conveniência, que costuma cobrar caro em testes.", "Test question: *do I need only one instance to exist* or *do I need everyone to reach the instance from anywhere*? The first is a lifecycle decision, which a container solves; the second is convenience, which usually costs dearly in tests."]),
    ] },
  { id: "padrao-factory", section: "lld", level: 1, icon: "factory", minutes: 11,
    title: ["Padrões Factory: Simple Factory, Factory Method e Abstract Factory", "Factory patterns: Simple Factory, Factory Method and Abstract Factory"],
    summary: ["Como esconder qual classe concreta é criada: três níveis de fábrica, com código, diagramas e uso em frameworks.", "How to hide which concrete class is created: three levels of factory, with code, diagrams and use in frameworks."],
    body: [
      p(["Considere um aplicativo que envia notificações. No início só há e-mail: `new EmailNotification()` aparece em vinte lugares. Depois surgem SMS e push, e cada um desses vinte lugares ganha um `if (canal === ...)`. O código de negócio passa a conhecer todas as classes concretas e qualquer novo canal obriga a editar todos. O problema geral é **acoplar quem usa um objeto à decisão de qual classe concreta instanciar**. As **fábricas** (*factories*) resolvem isso movendo a criação para um ponto único e fazendo o cliente depender apenas de uma interface.", "Consider an app that sends notifications. At first there is only email: `new EmailNotification()` appears in twenty places. Then SMS and push arrive, and each of those twenty places gains an `if (channel === ...)`. Business code now knows all concrete classes and any new channel forces editing all of them. The general problem is **coupling whoever uses an object to the decision of which concrete class to instantiate**. **Factories** solve this by moving creation to a single point and making the client depend only on an interface."]),
      p(["Existem três níveis de sofisticação, frequentemente confundidos. A **Simple Factory** (não é um padrão GoF formal) é uma função ou classe com um `switch`. O **Factory Method** é um padrão GoF em que a criação é um método que subclasses sobrescrevem. A **Abstract Factory** é um padrão GoF que cria *famílias* de objetos relacionados.", "There are three levels of sophistication, often confused. **Simple Factory** (not a formal GoF pattern) is a function or class with a `switch`. **Factory Method** is a GoF pattern in which creation is a method that subclasses override. **Abstract Factory** is a GoF pattern that creates *families* of related objects."]),
      table([["Aspecto", "Aspect"], ["Simple Factory", "Simple Factory"], ["Factory Method", "Factory Method"], ["Abstract Factory", "Abstract Factory"]],
        [["O que é", "What it is"], ["Função ou classe com um `switch` de criação", "Function or class with a creation `switch`"], ["Método de criação sobrescrito em subclasses", "Creation method overridden in subclasses"], ["Interface com vários métodos de criação, um por produto", "Interface with several creation methods, one per product"]],
        [["Mecanismo", "Mechanism"], ["Condicional", "Conditional"], ["Herança", "Inheritance"], ["Composição de fábricas", "Composition of factories"]],
        [["Cria", "Creates"], ["Um produto de vários tipos", "A product of several kinds"], ["Um produto, decidido pela subclasse", "One product, decided by the subclass"], ["Famílias de produtos compatíveis", "Families of compatible products"]],
        [["Respeita o OCP", "Respects OCP"], ["Não: cada tipo novo edita o `switch`", "No: each new type edits the `switch`"], ["Sim: nova subclasse", "Yes: new subclass"], ["Sim: nova fábrica concreta", "Yes: new concrete factory"]],
        [["Complexidade", "Complexity"], ["Baixa", "Low"], ["Média", "Medium"], ["Alta", "High"]],
      ),
      h(["Simple Factory", "Simple Factory"]),
      p(["É o ponto de partida e muitas vezes basta. Uma função recebe um identificador e devolve o objeto concreto através de uma interface comum. O cliente fica livre de `new` e dos `if`; só a fábrica conhece as classes concretas. A limitação é que cada novo tipo exige editar o `switch`, mas, quando a lista de tipos é pequena e estável, isso é aceitável e é a opção mais legível. Uma melhoria comum é substituir o `switch` por um **registro** (um mapa de chave para construtor), que permite adicionar tipos sem editar a fábrica.", "It is the starting point and often enough. A function receives an identifier and returns the concrete object through a common interface. The client is free of `new` and `if`s; only the factory knows the concrete classes. The limitation is that each new type requires editing the `switch`, but when the list of types is small and stable that is acceptable and it is the most readable option. A common improvement is replacing the `switch` with a **registry** (a map from key to constructor), which allows adding types without editing the factory."]),
      code(`interface Notification { send(to: string, text: string): Promise<void> }
class EmailNotification implements Notification { async send(to: string, text: string) { console.log("email", to, text); } }
class SmsNotification implements Notification { async send(to: string, text: string) { console.log("sms", to, text); } }
class PushNotification implements Notification { async send(to: string, text: string) { console.log("push", to, text); } }

type Channel = "email" | "sms" | "push";
function createNotification(channel: Channel): Notification {
  switch (channel) {
    case "email": return new EmailNotification();
    case "sms": return new SmsNotification();
    case "push": return new PushNotification();
  }                                        // exhaustive: TS flags a missing case
}

// Registry variant: open for extension
const registry = new Map<string, () => Notification>([
  ["email", () => new EmailNotification()],
  ["sms", () => new SmsNotification()],
]);
export const register = (key: string, make: () => Notification) => registry.set(key, make);
export const create = (key: string) => {
  const make = registry.get(key);
  if (!make) throw new Error("unknown channel " + key);
  return make();
};`),
      h(["Factory Method", "Factory Method"]),
      p(["O **Factory Method** define, em uma classe criadora, um método de criação (o *factory method*) que devolve um produto abstrato. As subclasses sobrescrevem o método para devolver produtos concretos diferentes. A classe base contém a lógica de negócio que *usa* o produto sem saber qual é. É o Template Method aplicado à criação. Os participantes são: **Product** (a interface), **ConcreteProduct**, **Creator** (declara o método fábrica e usa o produto) e **ConcreteCreator** (decide o produto).", "**Factory Method** defines, in a creator class, a creation method (the *factory method*) that returns an abstract product. Subclasses override the method to return different concrete products. The base class contains the business logic that *uses* the product without knowing which one it is. It is Template Method applied to creation. The participants are: **Product** (the interface), **ConcreteProduct**, **Creator** (declares the factory method and uses the product) and **ConcreteCreator** (decides the product)."]),
      fig(["Factory Method: o criador delega a criação à subclasse", "Factory Method: the creator delegates creation to the subclass"], [
        [node("cr", ["Creator (usa o produto)", "Creator (uses the product)"], "service")],
        [node("cc1", "EmailSender", "service"), node("cc2", "SmsSender", "service")],
        [node("pr", ["«interface» Notification", "«interface» Notification"], "edge")],
        [node("p1", "EmailNotification", "data"), node("p2", "SmsNotification", "data")],
      ], [edge("cc1", "cr", ["herda", "extends"], { dashed: true }), edge("cc2", "cr", ["herda", "extends"], { dashed: true }), edge("cr", "pr", ["usa", "uses"]), edge("cc1", "p1", ["cria", "creates"]), edge("cc2", "p2", ["cria", "creates"]), edge("p1", "pr", "", { dashed: true }), edge("p2", "pr", "", { dashed: true })]),
      code(`interface Transport { deliver(cargo: string): string }
class Truck implements Transport { deliver(c: string) { return "road: " + c; } }
class Ship implements Transport { deliver(c: string) { return "sea: " + c; } }

abstract class Logistics {
  protected abstract createTransport(): Transport;     // the factory method
  planDelivery(cargo: string): string {                 // business logic uses the abstract product
    const t = this.createTransport();
    return t.deliver(cargo);
  }
}
class RoadLogistics extends Logistics { protected createTransport() { return new Truck(); } }
class SeaLogistics extends Logistics { protected createTransport() { return new Ship(); } }

const plan = (l: Logistics) => l.planDelivery("books");
console.log(plan(new RoadLogistics()));   // road: books
console.log(plan(new SeaLogistics()));    // sea: books`),
      p(["Em linguagens modernas, a mesma ideia aparece sem subclasses: passa-se uma **função fábrica** como parâmetro (`new Logistics(() => new Truck())`), que é Strategy aplicado à criação. Em Java e C#, existem ainda **métodos fábrica estáticos** (`LocalDate.of(...)`, `List.of(...)`), com nomes expressivos que substituem sobrecargas confusas de construtor e podem devolver instâncias em cache ou subtipos.", "In modern languages the same idea appears without subclasses: a **factory function** is passed as a parameter (`new Logistics(() => new Truck())`), which is Strategy applied to creation. In Java and C# there are also **static factory methods** (`LocalDate.of(...)`, `List.of(...)`), with expressive names that replace confusing constructor overloads and can return cached instances or subtypes."]),
      h(["Abstract Factory", "Abstract Factory"]),
      p(["Quando os produtos formam **famílias** que precisam combinar, a **Abstract Factory** garante a consistência. Pense em uma biblioteca de interface com temas: um botão claro não deve aparecer ao lado de uma caixa de texto escura. A fábrica abstrata declara um método de criação para cada produto da família (`createButton`, `createCheckbox`) e cada fábrica concreta (`LightFactory`, `DarkFactory`) cria todos os produtos de um mesmo tema. O cliente recebe *uma* fábrica e a usa para tudo, nunca misturando famílias.", "When products form **families** that must match, **Abstract Factory** guarantees consistency. Think of a UI library with themes: a light button must not appear beside a dark text box. The abstract factory declares a creation method for each product in the family (`createButton`, `createCheckbox`) and each concrete factory (`LightFactory`, `DarkFactory`) creates all products of one theme. The client receives *one* factory and uses it for everything, never mixing families."]),
      fig(["Abstract Factory: duas famílias, dois produtos", "Abstract Factory: two families, two products"], [
        [node("cl", ["Cliente (UI)", "Client (UI)"], "client")],
        [node("af", ["«interface» UiFactory", "«interface» UiFactory"], "edge")],
        [node("lf", "LightFactory", "service"), node("df", "DarkFactory", "service")],
        [node("lb", "LightButton", "data"), node("lc", "LightCheckbox", "data"), node("db", "DarkButton", "data"), node("dc", "DarkCheckbox", "data")],
      ], [edge("cl", "af", ["usa", "uses"]), edge("lf", "af", "", { dashed: true }), edge("df", "af", "", { dashed: true }), edge("lf", "lb"), edge("lf", "lc"), edge("df", "db"), edge("df", "dc")]),
      code(`interface Button { render(): string }
interface Checkbox { render(): string }
interface UiFactory { createButton(): Button; createCheckbox(): Checkbox }

class LightButton implements Button { render() { return "[ light button ]"; } }
class LightCheckbox implements Checkbox { render() { return "[ ] light"; } }
class DarkButton implements Button { render() { return "[[ dark button ]]"; } }
class DarkCheckbox implements Checkbox { render() { return "[ ] dark"; } }

class LightFactory implements UiFactory {
  createButton() { return new LightButton(); }
  createCheckbox() { return new LightCheckbox(); }
}
class DarkFactory implements UiFactory {
  createButton() { return new DarkButton(); }
  createCheckbox() { return new DarkCheckbox(); }
}

function renderSettings(f: UiFactory): string {          // knows no concrete class
  return [f.createButton().render(), f.createCheckbox().render()].join(" ");
}
const theme: UiFactory = process.env.THEME === "dark" ? new DarkFactory() : new LightFactory();
console.log(renderSettings(theme));`),
      p(["A grande vantagem é a consistência entre produtos e a troca de uma família inteira mudando uma linha (a escolha da fábrica). O custo é que **adicionar um novo tipo de produto** (por exemplo `createSlider`) obriga a alterar a interface e todas as fábricas concretas. Por isso a Abstract Factory serve melhor quando as famílias variam e os tipos de produto são estáveis.", "The great advantage is consistency between products and swapping an entire family by changing a line (the factory choice). The cost is that **adding a new product type** (for example `createSlider`) forces changes to the interface and all concrete factories. That is why Abstract Factory fits best when families vary and product types are stable."]),
      h(["Como escolher", "How to choose"]),
      fig(["Escolhendo a fábrica", "Choosing the factory"], [
        [node("start", ["Preciso esconder o `new`?", "Do I need to hide the `new`?"], "client")],
        [node("a", ["Poucos tipos, estáveis", "Few, stable types"], "edge"), node("b", ["Criação varia por subclasse ou contexto", "Creation varies by subclass or context"], "edge"), node("c", ["Famílias de objetos que combinam", "Families of matching objects"], "edge")],
        [node("sf", "Simple Factory", "service"), node("fm", "Factory Method", "service"), node("abs", "Abstract Factory", "service")],
      ], [edge("start", "a"), edge("start", "b"), edge("start", "c"), edge("a", "sf"), edge("b", "fm"), edge("c", "abs")]),
      h(["Vantagens e desvantagens", "Advantages and disadvantages"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Disadvantages"]],
        [["O cliente depende de interfaces, não de classes concretas (DIP)", "The client depends on interfaces, not concrete classes (DIP)"], ["Mais classes e arquivos para um problema que às vezes um `new` resolve", "More classes and files for a problem that a `new` sometimes solves"]],
        [["A criação fica em um só lugar, fácil de mudar e de testar", "Creation lives in one place, easy to change and test"], ["Hierarquias paralelas de criadores e produtos no Factory Method", "Parallel hierarchies of creators and products in Factory Method"]],
        [["Novos produtos entram sem alterar o código cliente (OCP)", "New products enter without changing client code (OCP)"], ["Abstract Factory é rígida quando surgem novos tipos de produto", "Abstract Factory is rigid when new product types appear"]],
        [["Permite reuso de instâncias (pool, cache) na criação", "Allows reusing instances (pool, cache) during creation"], ["Pode esconder custo e erros de criação atrás de uma chamada simples", "May hide creation cost and errors behind a simple call"]],
      ),
      h(["Quando evitar", "When to avoid"]),
      ul(
        ["Quando existe uma só classe concreta e não há previsão realista de outra: um `new` direto é mais claro (YAGNI).", "When there is a single concrete class and no realistic prospect of another: a plain `new` is clearer (YAGNI)."],
        ["Quando a linguagem permite passar uma função ou um construtor como parâmetro, o que dispensa hierarquias inteiras de fábricas.", "When the language allows passing a function or constructor as a parameter, which removes whole hierarchies of factories."],
        ["Quando um contêiner de DI já decide qual implementação injetar por configuração.", "When a DI container already decides which implementation to inject by configuration."],
        ["Para objetos muito simples (valores, DTOs), em que a fábrica só adiciona cerimônia.", "For very simple objects (values, DTOs), where the factory only adds ceremony."],
      ),
      h(["Uso real em frameworks e bibliotecas", "Real use in frameworks and libraries"]),
      ul(
        ["**DOM**: `document.createElement(tag)` é uma fábrica simples que devolve o elemento certo para cada tag.", "**DOM**: `document.createElement(tag)` is a simple factory returning the right element for each tag."],
        ["**Java**: `Calendar.getInstance()`, `NumberFormat.getInstance()` e `Collections.unmodifiableList` são métodos fábrica; `DocumentBuilderFactory` e `SAXParserFactory` são fábricas abstratas e configuráveis.", "**Java**: `Calendar.getInstance()`, `NumberFormat.getInstance()` and `Collections.unmodifiableList` are factory methods; `DocumentBuilderFactory` and `SAXParserFactory` are abstract, configurable factories."],
        ["**React**: `React.createElement` (o que o JSX compila) escolhe o que criar conforme o tipo recebido.", "**React**: `React.createElement` (what JSX compiles to) chooses what to create according to the type received."],
        ["**ORMs e drivers de banco**: a fábrica de conexões devolve o driver correto a partir de uma URL, como `postgres://` ou `mysql://`.", "**ORMs and database drivers**: the connection factory returns the correct driver from a URL, such as `postgres://` or `mysql://`."],
        ["**Spring**: `BeanFactory` e `FactoryBean` criam e configuram objetos do contêiner.", "**Spring**: `BeanFactory` and `FactoryBean` create and configure container objects."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Criar uma fábrica para cada classe por hábito, produzindo uma coleção de `XFactory` que só chamam `new X()`.", "Creating a factory for every class by habit, producing a collection of `XFactory` that only call `new X()`."],
        ["Misturar na fábrica regras de negócio, que deveriam estar no produto ou em um serviço.", "Mixing business rules into the factory, which should be in the product or in a service."],
        ["Deixar o `switch` crescer indefinidamente em vez de migrar para um registro ou Factory Method.", "Letting the `switch` grow indefinitely instead of migrating to a registry or Factory Method."],
        ["Fazer a fábrica devolver o tipo concreto em vez da interface, perdendo o benefício.", "Having the factory return the concrete type instead of the interface, losing the benefit."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Fábricas isolam a decisão de qual classe concreta instanciar e deixam o cliente depender de uma interface.", "Factories isolate the decision of which concrete class to instantiate and let the client depend on an interface."],
        ["Simple Factory: um `switch` ou registro; Factory Method: subclasses decidem; Abstract Factory: famílias de produtos compatíveis.", "Simple Factory: a `switch` or registry; Factory Method: subclasses decide; Abstract Factory: families of compatible products."],
        ["Prefira a forma mais simples que resolva o problema e evite fábricas sem variação real.", "Prefer the simplest form that solves the problem and avoid factories without real variation."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Simple Factory é um padrão GoF?** Não, mas é a base de todas as outras e muito usada.", "**Is Simple Factory a GoF pattern?** No, but it is the basis of all the others and widely used."],
        ["**Factory Method e Abstract Factory se misturam?** Sim: cada método de uma Abstract Factory costuma ser um Factory Method.", "**Do Factory Method and Abstract Factory mix?** Yes: each method of an Abstract Factory is usually a Factory Method."],
        ["**Qual a relação com injeção de dependências?** Um contêiner de DI é uma fábrica genérica e configurável; muitas vezes substitui fábricas escritas à mão.", "**What is the relation to dependency injection?** A DI container is a generic, configurable factory; it often replaces hand-written factories."],
        ["**Fábrica precisa ser estática?** Não. Uma fábrica injetada, com estado, pode ser trocada em testes; fábricas estáticas são mais difíceis de substituir.", "**Does a factory need to be static?** No. An injected, stateful factory can be swapped in tests; static factories are harder to replace."],
      ),
      tip(["Se você está escrevendo `if (tipo === ...) return new ...` em mais de um lugar, está na hora de uma fábrica. Se está só em um lugar e não cresce, o `if` já é a fábrica.", "If you are writing `if (type === ...) return new ...` in more than one place, it is time for a factory. If it is in only one place and does not grow, the `if` already is the factory."]),
    ] },
  { id: "padrao-builder", section: "lld", level: 1, icon: "build", minutes: 10,
    title: ["Padrão Builder", "Builder pattern"],
    summary: ["Construir objetos complexos passo a passo, sem construtores gigantes: Director, fluent builder e builders com validação.", "Building complex objects step by step, without giant constructors: Director, fluent builder and builders with validation."],
    body: [
      p(["Imagine uma classe `HttpRequest` com URL, método, cabeçalhos, corpo, tempo limite, número de tentativas, proxy e autenticação. A maior parte desses campos é opcional. Como construí-la? Um construtor com oito parâmetros é ilegível (`new HttpRequest(url, \"GET\", null, null, 5000, 3, null, true)`: o que significa cada um?). Vários construtores sobrecarregados, um para cada combinação, geram o chamado **construtor telescópico**. Setters deixam o objeto mutável e permitem estados inválidos pela metade. O padrão **Builder** (criacional, GoF) resolve esse problema **separando a construção de um objeto complexo da sua representação**, com passos nomeados e uma validação final.", "Imagine an `HttpRequest` class with URL, method, headers, body, timeout, retry count, proxy and authentication. Most of these fields are optional. How do you build it? A constructor with eight parameters is unreadable (`new HttpRequest(url, \"GET\", null, null, 5000, 3, null, true)`: what does each one mean?). Several overloaded constructors, one per combination, produce the so-called **telescoping constructor**. Setters make the object mutable and allow half-built invalid states. The **Builder** pattern (creational, GoF) solves this problem by **separating the construction of a complex object from its representation**, with named steps and a final validation."]),
      h(["Estrutura", "Structure"]),
      p(["Na forma mais comum hoje (*fluent builder*), o próprio builder oferece métodos nomeados que configuram cada parte e devolvem `this`, permitindo encadear chamadas; o método final `build()` valida e cria o objeto, que pode ser imutável. A descrição clássica do GoF tem mais um participante, o **Director**, que conhece uma *receita* (a ordem dos passos) e usa um builder abstrato; builders concretos produzem representações diferentes a partir da mesma receita.", "In the most common form today (*fluent builder*), the builder itself offers named methods that configure each part and return `this`, allowing chained calls; the final `build()` method validates and creates the object, which can be immutable. The classic GoF description has one more participant, the **Director**, which knows a *recipe* (the order of steps) and uses an abstract builder; concrete builders produce different representations from the same recipe."]),
      fig(["Estrutura do Builder com Director", "Builder structure with Director"], [
        [node("cl", "Client", "client")],
        [node("di", "Director", "service")],
        [node("bi", ["«interface» Builder", "«interface» Builder"], "edge")],
        [node("b1", "HtmlBuilder", "service"), node("b2", "MarkdownBuilder", "service")],
        [node("r1", ["Produto HTML", "HTML product"], "data"), node("r2", ["Produto Markdown", "Markdown product"], "data")],
      ], [edge("cl", "di"), edge("di", "bi", ["passos", "steps"]), edge("b1", "bi", "", { dashed: true }), edge("b2", "bi", "", { dashed: true }), edge("b1", "r1", "build()"), edge("b2", "r2", "build()")]),
      h(["Fluent builder em TypeScript", "Fluent builder in TypeScript"]),
      code(`interface HttpRequest {
  readonly url: string;
  readonly method: "GET" | "POST" | "PUT" | "DELETE";
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: string;
  readonly timeoutMs: number;
  readonly retries: number;
}

class HttpRequestBuilder {
  private url?: string;
  private method: HttpRequest["method"] = "GET";
  private headers: Record<string, string> = {};
  private body?: string;
  private timeoutMs = 10_000;
  private retries = 0;

  to(url: string) { this.url = url; return this; }
  usingMethod(m: HttpRequest["method"]) { this.method = m; return this; }
  header(name: string, value: string) { this.headers[name] = value; return this; }
  json(payload: unknown) {
    this.body = JSON.stringify(payload);
    return this.header("Content-Type", "application/json");
  }
  timeout(ms: number) { this.timeoutMs = ms; return this; }
  retry(n: number) { this.retries = n; return this; }

  build(): HttpRequest {                         // validation happens in one place
    if (!this.url) throw new Error("url is required");
    if (this.body && this.method === "GET") throw new Error("GET cannot have a body");
    if (this.retries < 0) throw new Error("retries must be >= 0");
    return Object.freeze({
      url: this.url, method: this.method, headers: { ...this.headers },
      body: this.body, timeoutMs: this.timeoutMs, retries: this.retries,
    });
  }
}

const req = new HttpRequestBuilder()
  .to("https://api.example.com/orders")
  .usingMethod("POST")
  .json({ sku: "A-1", qty: 2 })
  .timeout(3000)
  .retry(2)
  .build();`),
      p(["Note os ganhos: cada chamada diz o que configura, a ordem não importa, os opcionais têm valores padrão, a validação acontece uma vez antes de o objeto existir e o resultado é imutável. Em linguagens que têm *argumentos nomeados* e *parâmetros opcionais* (Python, Kotlin, C#), um simples construtor com argumentos nomeados muitas vezes substitui o builder. Em TypeScript, um objeto de opções (`new Request({ url, method, timeoutMs })`) resolve a maioria dos casos sem um builder separado.", "Note the gains: each call says what it configures, order does not matter, optional values have defaults, validation happens once before the object exists and the result is immutable. In languages with *named arguments* and *optional parameters* (Python, Kotlin, C#), a plain constructor with named arguments often replaces the builder. In TypeScript, an options object (`new Request({ url, method, timeoutMs })`) solves most cases without a separate builder."]),
      h(["Director e builders alternativos", "Director and alternative builders"]),
      p(["O **Director** é útil quando a *sequência de passos* é reutilizada, por exemplo, montar sempre um relatório com cabeçalho, corpo e rodapé, mas gerando HTML ou Markdown. O Director conhece a ordem; cada builder concreto sabe produzir o seu formato. Outro uso é a construção de estruturas diferentes (um carro e o seu manual) a partir dos mesmos passos.", "The **Director** is useful when the *sequence of steps* is reused, for example always assembling a report with header, body and footer, but generating HTML or Markdown. The Director knows the order; each concrete builder knows how to produce its format. Another use is building different structures (a car and its manual) from the same steps."]),
      code(`interface ReportBuilder {
  title(text: string): this;
  paragraph(text: string): this;
  build(): string;
}
class HtmlReportBuilder implements ReportBuilder {
  private parts: string[] = [];
  title(t: string) { this.parts.push("<h1>" + t + "</h1>"); return this; }
  paragraph(t: string) { this.parts.push("<p>" + t + "</p>"); return this; }
  build() { return this.parts.join(""); }
}
class MarkdownReportBuilder implements ReportBuilder {
  private parts: string[] = [];
  title(t: string) { this.parts.push("# " + t); return this; }
  paragraph(t: string) { this.parts.push(t); return this; }
  build() { return this.parts.join("\\n\\n"); }
}
class ReportDirector {                              // knows the recipe, not the format
  monthly(b: ReportBuilder, month: string, summary: string) {
    return b.title("Report " + month).paragraph(summary).paragraph("End of report").build();
  }
}
const d = new ReportDirector();
console.log(d.monthly(new HtmlReportBuilder(), "June", "Revenue grew."));
console.log(d.monthly(new MarkdownReportBuilder(), "June", "Revenue grew."));`),
      h(["Variações e técnicas relacionadas", "Variations and related techniques"]),
      table([["Variação", "Variation"], ["Descrição", "Description"], ["Quando usar", "When to use"]],
        [["Fluent / encadeado", "Fluent / chained"], ["Métodos devolvem `this` para encadear", "Methods return `this` to chain"], ["Padrão em Java, C# e TypeScript para objetos com muitos campos", "Default in Java, C# and TypeScript for objects with many fields"]],
        [["Step builder", "Step builder"], ["Interfaces sucessivas obrigam a ordem e os campos obrigatórios no compilador", "Successive interfaces enforce order and mandatory fields at compile time"], ["Quando campos obrigatórios não podem ser esquecidos", "When mandatory fields cannot be forgotten"]],
        [["Builder aninhado e imutável", "Nested immutable builder"], ["Classe estática interna com construtor privado no produto (Java, estilo Effective Java)", "Static inner class with private constructor in the product (Java, Effective Java style)"], ["Para garantir imutabilidade do resultado", "To guarantee the result's immutability"]],
        [["Objeto de opções", "Options object"], ["Um único parâmetro com campos nomeados", "A single parameter with named fields"], ["Alternativa simples em TypeScript e JavaScript", "Simple alternative in TypeScript and JavaScript"]],
        [["Copiar-e-modificar (`with`)", "Copy-and-modify (`with`)"], ["Métodos devolvem uma cópia modificada do objeto imutável", "Methods return a modified copy of the immutable object"], ["Valores pequenos e imutáveis (datas, dinheiro)", "Small, immutable values (dates, money)"]],
      ),
      p(["O **step builder** usa o sistema de tipos para tornar certos erros impossíveis. Cada etapa devolve uma interface que só expõe o próximo passo permitido, de modo que esquecer o campo obrigatório vira erro de compilação, e não de execução.", "The **step builder** uses the type system to make certain errors impossible. Each stage returns an interface that only exposes the next allowed step, so forgetting a mandatory field becomes a compile error, not a run-time one."]),
      code(`interface NeedsUrl { to(url: string): NeedsMethod }
interface NeedsMethod { usingMethod(m: "GET" | "POST"): Optional }
interface Optional { timeout(ms: number): Optional; build(): { url: string; method: string; timeoutMs: number } }

function request(): NeedsUrl {
  let url = ""; let method = "GET"; let timeoutMs = 10000;
  const opt: Optional = {
    timeout(ms) { timeoutMs = ms; return opt; },
    build() { return { url, method, timeoutMs }; },
  };
  return { to(u) { url = u; return { usingMethod(m) { method = m; return opt; } }; } };
}
request().to("https://x.io").usingMethod("GET").timeout(500).build();   // OK
// request().build();                      // compile error: build does not exist yet`),
      h(["Vantagens e desvantagens", "Advantages and disadvantages"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Disadvantages"]],
        [["Código de criação legível e autodocumentado", "Readable, self-documenting creation code"], ["Mais código: uma classe builder para cada produto", "More code: a builder class for each product"]],
        [["Evita construtores com muitos parâmetros e combinações", "Avoids constructors with many parameters and combinations"], ["Pode ser exagero para objetos com poucos campos", "May be overkill for objects with few fields"]],
        [["Objetos imutáveis e sempre válidos após o `build()`", "Immutable objects that are always valid after `build()`"], ["O builder em si é mutável e não é seguro entre threads se compartilhado", "The builder itself is mutable and not thread-safe if shared"]],
        [["Reutiliza a mesma sequência para produtos diferentes (Director)", "Reuses the same sequence for different products (Director)"], ["O produto e o builder precisam ser mantidos em sincronia a cada novo campo", "Product and builder must be kept in sync with every new field"]],
        [["Validação concentrada em um ponto", "Validation concentrated in one point"], ["Erros de configuração só aparecem em tempo de execução, exceto no step builder", "Configuration errors only appear at run time, except in the step builder"]],
      ),
      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      ul(
        ["**Use** quando o objeto tem muitos parâmetros opcionais, quando a construção tem vários passos, quando é preciso gerar representações diferentes do mesmo conteúdo ou quando a imutabilidade e a validação importam.", "**Use it** when the object has many optional parameters, when construction has several steps, when different representations of the same content must be generated or when immutability and validation matter."],
        ["**Evite** quando o objeto tem dois ou três campos: um construtor ou um objeto de opções basta.", "**Avoid it** when the object has two or three fields: a constructor or options object is enough."],
        ["**Evite** quando a linguagem já oferece argumentos nomeados, valores padrão e tipos de dados (`data class`, `record`): o recurso nativo é mais simples.", "**Avoid it** when the language already offers named arguments, default values and data types (`data class`, `record`): the native feature is simpler."],
        ["**Cuidado** com builders que expõem o objeto pela metade: se `build()` pode ser chamado antes de campos obrigatórios, use o step builder.", "**Beware** of builders exposing a half-built object: if `build()` can be called before mandatory fields, use the step builder."],
      ),
      h(["Uso real em frameworks e bibliotecas", "Real use in frameworks and libraries"]),
      ul(
        ["**Java**: `StringBuilder`, `Stream.builder()`, `HttpRequest.newBuilder()` (cliente HTTP do JDK 11) e `Locale.Builder`; o Lombok gera builders com a anotação `@Builder`.", "**Java**: `StringBuilder`, `Stream.builder()`, `HttpRequest.newBuilder()` (the JDK 11 HTTP client) and `Locale.Builder`; Lombok generates builders with the `@Builder` annotation."],
        ["**Construtores de consulta**: Knex, SQLAlchemy Core, jOOQ e Criteria API montam SQL em etapas encadeadas.", "**Query builders**: Knex, SQLAlchemy Core, jOOQ and the Criteria API assemble SQL in chained steps."],
        ["**Protocol Buffers e gRPC**: as classes geradas para Java trazem um `Builder` por mensagem.", "**Protocol Buffers and gRPC**: the classes generated for Java come with a `Builder` per message."],
        ["**Kubernetes e infraestrutura como código**: clientes de SDKs de nuvem frequentemente usam builders para montar recursos com muitas opções.", "**Kubernetes and infrastructure as code**: cloud SDK clients often use builders to assemble resources with many options."],
        ["**Testes**: *test data builders* criam objetos de teste com valores padrão válidos, alterando apenas o que o teste cobre.", "**Tests**: *test data builders* create test objects with valid defaults, changing only what the test covers."],
      ),
      code(`// Test data builder: the test only states what matters
class OrderBuilder {
  private status: "new" | "paid" = "new";
  private items: { sku: string; qty: number }[] = [{ sku: "default", qty: 1 }];
  paid() { this.status = "paid"; return this; }
  withItem(sku: string, qty: number) { this.items = [{ sku, qty }]; return this; }
  build() { return { status: this.status, items: this.items }; }
}
const order = new OrderBuilder().paid().withItem("A-1", 3).build();`),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Reutilizar a mesma instância de builder para criar produtos diferentes sem *resetar* o estado, vazando valores entre eles.", "Reusing the same builder instance to create different products without *resetting* the state, leaking values between them."],
        ["Colocar regras de negócio no builder em vez de validar apenas a consistência do objeto.", "Putting business rules in the builder instead of validating only the object's consistency."],
        ["Deixar o objeto produto mutável por setters públicos, perdendo a vantagem.", "Leaving the product object mutable with public setters, losing the advantage."],
        ["Esquecer de copiar coleções mutáveis no `build()`, de modo que o builder alterado depois muda o produto já criado.", "Forgetting to copy mutable collections in `build()`, so a later-modified builder changes the product already created."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Builder separa a construção passo a passo de um objeto complexo da sua representação final.", "Builder separates step-by-step construction of a complex object from its final representation."],
        ["A forma fluente com `build()` e validação final resolve construtores telescópicos e produz objetos imutáveis.", "The fluent form with `build()` and final validation solves telescoping constructors and produces immutable objects."],
        ["O Director reaproveita receitas; o step builder faz o compilador impor campos obrigatórios.", "The Director reuses recipes; the step builder makes the compiler enforce mandatory fields."],
        ["Em linguagens com argumentos nomeados ou objetos de opções, prefira o recurso nativo se bastar.", "In languages with named arguments or options objects, prefer the native feature if it is enough."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Builder e Factory são a mesma coisa?** Não. A fábrica decide *qual* objeto criar e devolve pronto; o builder controla *como* um objeto complexo é montado em etapas.", "**Are Builder and Factory the same thing?** No. A factory decides *which* object to create and returns it ready; a builder controls *how* a complex object is assembled in stages."],
        ["**O builder precisa de uma interface?** Só se houver várias representações. Para um produto único, uma classe concreta basta.", "**Does the builder need an interface?** Only if there are several representations. For a single product, a concrete class is enough."],
        ["**Builder é thread-safe?** Normalmente não; use um builder por thread ou por chamada, e torne o produto imutável.", "**Is a builder thread-safe?** Usually not; use one builder per thread or per call, and make the product immutable."],
        ["**Por que o `build()` valida?** Porque é o último momento antes de o objeto existir; assim ele nunca nasce em estado inválido.", "**Why does `build()` validate?** Because it is the last moment before the object exists; this way it is never born in an invalid state."],
      ),
      tip(["Um sinal de que você precisa de Builder: ao ler uma chamada de construtor, você precisa abrir a definição da classe para entender o que cada argumento significa.", "A sign you need a Builder: when reading a constructor call, you need to open the class definition to understand what each argument means."]),
    ] },
  { id: "padrao-adapter", section: "lld", level: 1, icon: "settings_input_hdmi", minutes: 10,
    title: ["Padrão Adapter", "Adapter pattern"],
    summary: ["Fazer interfaces incompatíveis trabalharem juntas: adapter de objeto e de classe, código completo e uso na fronteira com serviços externos.", "Making incompatible interfaces work together: object and class adapters, complete code and use at the boundary with external services."],
    body: [
      p(["Você está viajando e leva um carregador com plugue de três pinos, mas a tomada do hotel tem outro formato. Você não troca o carregador nem a parede: usa um **adaptador de tomada**. No software, o mesmo problema aparece o tempo todo: seu código espera uma interface (`PaymentGateway.charge(amount)`), mas a biblioteca de um provedor oferece outra (`provider.createTransaction({ value_cents, currency })`). Reescrever sua aplicação para o formato do provedor espalharia detalhes externos por todo o código; modificar a biblioteca costuma ser impossível. O padrão **Adapter** (estrutural, GoF), também chamado de **Wrapper**, converte a interface de uma classe na interface que o cliente espera, permitindo que classes com interfaces incompatíveis colaborem.", "You are traveling and carry a charger with a three-pin plug, but the hotel outlet has another shape. You change neither the charger nor the wall: you use a **plug adapter**. In software the same problem appears all the time: your code expects one interface (`PaymentGateway.charge(amount)`), but a provider's library offers another (`provider.createTransaction({ value_cents, currency })`). Rewriting your application to the provider's format would scatter external details through the code; modifying the library is usually impossible. The **Adapter** pattern (structural, GoF), also called **Wrapper**, converts one class's interface into the interface the client expects, letting classes with incompatible interfaces collaborate."]),
      h(["Estrutura e participantes", "Structure and participants"]),
      ul(
        ["**Target**: a interface que o cliente conhece e espera.", "**Target**: the interface the client knows and expects."],
        ["**Client**: o código que trabalha com o Target.", "**Client**: the code that works with the Target."],
        ["**Adaptee**: a classe existente, útil mas com interface incompatível.", "**Adaptee**: the existing class, useful but with an incompatible interface."],
        ["**Adapter**: implementa o Target e traduz cada chamada em chamadas ao Adaptee.", "**Adapter**: implements the Target and translates each call into calls to the Adaptee."],
      ),
      fig(["Estrutura do Adapter (versão por objeto)", "Adapter structure (object version)"], [
        [node("cl", "Client", "client")],
        [node("tg", ["«interface» PaymentGateway", "«interface» PaymentGateway"], "edge")],
        [node("ad", "ProviderAdapter", "service")],
        [node("sdk", ["SDK do provedor (Adaptee)", "Provider SDK (Adaptee)"], "ext")],
      ], [edge("cl", "tg", ["usa", "uses"]), edge("ad", "tg", ["implementa", "implements"], { dashed: true }), edge("ad", "sdk", ["traduz e delega", "translates and delegates"])]),
      h(["Exemplo completo: adaptando um provedor de pagamentos", "Complete example: adapting a payment provider"]),
      code(`// Target: what OUR application understands (domain language, amounts in decimal)
interface PaymentGateway {
  charge(customerId: string, amount: number, currency: string): Promise<{ ok: boolean; id: string }>;
}

// Adaptee: a third-party SDK we cannot change (cents, different names, different result)
class AcmePaySdk {
  async createTransaction(req: { account: string; value_cents: number; ccy: string }) {
    return { status: "APPROVED", txn_ref: "tx_123" };   // or "DECLINED"
  }
}

// Adapter: translates in both directions
class AcmePayAdapter implements PaymentGateway {
  constructor(private readonly sdk: AcmePaySdk) {}

  async charge(customerId: string, amount: number, currency: string) {
    const res = await this.sdk.createTransaction({
      account: customerId,
      value_cents: Math.round(amount * 100),      // unit conversion
      ccy: currency.toUpperCase(),
    });
    return { ok: res.status === "APPROVED", id: res.txn_ref };   // result conversion
  }
}

// Client: depends only on the Target
class Checkout {
  constructor(private readonly gateway: PaymentGateway) {}
  async pay(customerId: string, total: number) {
    const r = await this.gateway.charge(customerId, total, "brl");
    if (!r.ok) throw new Error("payment declined");
    return r.id;
  }
}
const checkout = new Checkout(new AcmePayAdapter(new AcmePaySdk()));
// Switching provider = writing another adapter. Checkout does not change.`),
      p(["Duas observações: o adaptador *concentra* todo o conhecimento do provedor (nomes de campos, unidades, formatos de erro); e como a aplicação depende do Target, os testes usam um `FakeGateway` sem tocar na rede. Trocar de provedor passa a significar escrever um novo adaptador, sem alterar o `Checkout`.", "Two observations: the adapter *concentrates* all knowledge of the provider (field names, units, error formats); and since the application depends on the Target, tests use a `FakeGateway` without touching the network. Switching provider means writing a new adapter, without changing `Checkout`."]),
      h(["Adapter de objeto x Adapter de classe", "Object adapter vs class adapter"]),
      p(["Há duas formas. No **adapter de objeto** (a mais comum e preferida), o adaptador *contém* uma instância do Adaptee e delega a ela (composição), como no exemplo. No **adapter de classe**, o adaptador *herda* do Adaptee e implementa o Target, o que exige herança múltipla ou a combinação de herança e interface; ele evita a delegação, mas fica preso à classe concreta e não funciona se o Adaptee for `final`.", "There are two forms. In the **object adapter** (the most common and preferred), the adapter *holds* an Adaptee instance and delegates to it (composition), as in the example. In the **class adapter**, the adapter *inherits* from the Adaptee and implements the Target, which requires multiple inheritance or a combination of inheritance and interface; it avoids delegation but is tied to the concrete class and does not work if the Adaptee is `final`."]),
      table([["Aspecto", "Aspect"], ["Adapter de objeto", "Object adapter"], ["Adapter de classe", "Class adapter"]],
        [["Mecanismo", "Mechanism"], ["Composição (tem um Adaptee)", "Composition (has an Adaptee)"], ["Herança (é um Adaptee)", "Inheritance (is an Adaptee)"]],
        [["Adaptar subclasses do Adaptee", "Adapting Adaptee subclasses"], ["Sim, qualquer instância serve", "Yes, any instance works"], ["Não, adapta só a classe herdada", "No, adapts only the inherited class"]],
        [["Sobrescrever comportamento do Adaptee", "Overriding Adaptee behavior"], ["Mais difícil", "Harder"], ["Fácil, por sobrescrita", "Easy, by overriding"]],
        [["Suporte em linguagens", "Language support"], ["Qualquer uma", "Any"], ["Precisa de herança múltipla (C++, Python) ou herança mais interface", "Needs multiple inheritance (C++, Python) or inheritance plus interface"]],
        [["Recomendação", "Recommendation"], ["Padrão de partida", "Default starting point"], ["Casos pontuais", "Specific cases"]],
      ),
      h(["Adaptando coleções e dados", "Adapting collections and data"]),
      p(["Nem todo adaptador é um serviço externo. Um uso muito frequente é converter formatos de dados internos: transformar um modelo legado em um modelo novo, adaptar uma lista de objetos de uma API para as estruturas de um componente de interface ou fazer um arquivo ser lido como um fluxo. O adaptador de dados também é uma peça-chave de migrações graduais: o código novo enxerga a interface nova enquanto, por baixo, o adaptador consulta o sistema antigo (*strangler fig*).", "Not every adapter is an external service. A very frequent use is converting internal data formats: turning a legacy model into a new model, adapting a list of objects from an API to the structures of a UI component or making a file be read as a stream. The data adapter is also a key piece in gradual migrations: new code sees the new interface while underneath the adapter queries the old system (*strangler fig*)."]),
      code(`// Legacy model returned by an old API
interface LegacyUser { usr_id: number; usr_nm: string; dt_birth: string }
// Model the new code wants
interface User { id: string; name: string; birthDate: Date }

class LegacyUserAdapter {
  static toUser(l: LegacyUser): User {
    return { id: String(l.usr_id), name: l.usr_nm.trim(), birthDate: new Date(l.dt_birth) };
  }
}
interface UserSource { find(id: string): Promise<User> }
class LegacyUserSource implements UserSource {
  constructor(private api: { get(id: number): Promise<LegacyUser> }) {}
  async find(id: string) { return LegacyUserAdapter.toUser(await this.api.get(Number(id))); }
}`),
      h(["Adapter x padrões parecidos", "Adapter vs similar patterns"]),
      table([["Padrão", "Pattern"], ["O que faz", "What it does"], ["Diferença para o Adapter", "Difference from Adapter"]],
        [["Facade", "Facade"], ["Simplifica um subsistema inteiro com uma interface nova", "Simplifies a whole subsystem with a new interface"], ["O Adapter compatibiliza uma interface *existente*; a Facade *inventa* uma mais simples", "Adapter reconciles an *existing* interface; Facade *invents* a simpler one"]],
        [["Decorator", "Decorator"], ["Acrescenta comportamento mantendo a mesma interface", "Adds behavior keeping the same interface"], ["O Adapter muda a interface; o Decorator preserva", "Adapter changes the interface; Decorator preserves it"]],
        [["Proxy", "Proxy"], ["Controla o acesso mantendo a mesma interface", "Controls access keeping the same interface"], ["O Proxy não traduz interfaces", "Proxy does not translate interfaces"]],
        [["Bridge", "Bridge"], ["Separa abstração e implementação desde o projeto", "Separates abstraction and implementation from the design stage"], ["O Adapter é aplicado depois, a código existente", "Adapter is applied afterward, to existing code"]],
      ),
      h(["Vantagens e desvantagens", "Advantages and disadvantages"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Disadvantages"]],
        [["Isola detalhes de bibliotecas externas em um só lugar", "Isolates external library details in one place"], ["Adiciona uma camada e mais classes a manter", "Adds a layer and more classes to maintain"]],
        [["Respeita o SRP (a tradução é uma responsabilidade própria) e o OCP", "Respects SRP (translation is its own responsibility) and OCP"], ["Se a interface adaptada é muito diferente, o adaptador fica complexo e pode vazar abstrações", "If the adapted interface is very different, the adapter becomes complex and may leak abstractions"]],
        [["Permite reutilizar código legado sem modificá-lo", "Allows reusing legacy code without modifying it"], ["Pode esconder custos de desempenho (conversões a cada chamada)", "May hide performance costs (conversions on every call)"]],
        [["Facilita trocar provedores e testar com dublês", "Eases swapping providers and testing with doubles"], ["Recursos exclusivos de um provedor podem não caber na interface comum", "Provider-exclusive features may not fit the common interface"]],
      ),
      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      ul(
        ["**Use** ao integrar bibliotecas e serviços de terceiros que você pode querer trocar, ao reaproveitar classes legadas, ao migrar de um modelo de dados para outro e ao padronizar vários provedores sob um contrato (pagamentos, e-mail, armazenamento).", "**Use it** when integrating third-party libraries and services you may want to swap, when reusing legacy classes, when migrating from one data model to another and when standardizing several providers under one contract (payments, email, storage)."],
        ["**Evite** quando você controla as duas pontas: ajuste a interface diretamente, em vez de adicionar uma camada de tradução.", "**Avoid it** when you control both ends: adjust the interface directly instead of adding a translation layer."],
        ["**Evite** o *adaptador de adaptador*: se há mais de um nível de tradução, repense a interface alvo.", "**Avoid** the *adapter of an adapter*: if there is more than one level of translation, rethink the target interface."],
        ["**Cuidado** com o menor denominador comum: uma interface alvo que só tem o que todos os provedores têm pode empobrecer a aplicação; estenda com capacidades opcionais quando for preciso.", "**Beware** of the lowest common denominator: a target interface with only what all providers have can impoverish the application; extend with optional capabilities when needed."],
      ),
      h(["Uso real em frameworks e bibliotecas", "Real use in frameworks and libraries"]),
      ul(
        ["**Java**: `InputStreamReader` adapta um `InputStream` (bytes) para um `Reader` (caracteres); `Arrays.asList` adapta um array à interface `List`.", "**Java**: `InputStreamReader` adapts an `InputStream` (bytes) to a `Reader` (characters); `Arrays.asList` adapts an array to the `List` interface."],
        ["**Drivers de banco**: JDBC, ODBC e as interfaces de bancos como `database/sql` do Go são interfaces comuns; cada driver é um adaptador do protocolo do banco.", "**Database drivers**: JDBC, ODBC and database interfaces such as Go's `database/sql` are common interfaces; each driver is an adapter of the database protocol."],
        ["**Web**: *adapters* do Express/Fastify para execução em ambientes serverless; no Spring MVC, o `HandlerAdapter` chama diferentes tipos de controladores de modo uniforme.", "**Web**: Express/Fastify *adapters* for serverless execution; in Spring MVC, the `HandlerAdapter` calls different kinds of controllers uniformly."],
        ["**Redux e React**: bibliotecas como `react-redux` adaptam o estado do store à interface de componentes.", "**Redux and React**: libraries such as `react-redux` adapt store state to the component interface."],
        ["**Arquitetura hexagonal**: todos os *adapters* da borda (HTTP, banco, filas) são aplicações deste padrão.", "**Hexagonal architecture**: all the edge *adapters* (HTTP, database, queues) are applications of this pattern."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Colocar regras de negócio no adaptador, que deveria apenas traduzir.", "Putting business rules in the adapter, which should only translate."],
        ["Vazar tipos do provedor pela interface alvo (devolver o objeto de resposta do SDK em vez de um tipo do domínio).", "Leaking provider types through the target interface (returning the SDK's response object instead of a domain type)."],
        ["Ignorar a tradução de **erros**: o adaptador deve converter exceções do provedor em erros do domínio.", "Ignoring the translation of **errors**: the adapter should convert provider exceptions into domain errors."],
        ["Criar o adaptador dentro do cliente com `new`, em vez de injetá-lo, o que anula o ganho de testabilidade.", "Creating the adapter inside the client with `new` instead of injecting it, which cancels the testability gain."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Adapter converte a interface de uma classe na que o cliente espera, sem alterar a classe original.", "Adapter converts one class's interface into the one the client expects, without changing the original class."],
        ["Prefira a versão por objeto (composição); a de classe depende de herança.", "Prefer the object version (composition); the class one depends on inheritance."],
        ["O adaptador concentra a tradução de nomes, unidades, formatos e erros, e é a base de ports and adapters.", "The adapter concentrates translation of names, units, formats and errors, and is the basis of ports and adapters."],
        ["Não confunda com Facade, Decorator e Proxy: pergunte o que muda.", "Do not confuse it with Facade, Decorator and Proxy: ask what changes."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Adapter e Wrapper são a mesma coisa?** Wrapper é o nome genérico para qualquer objeto que embrulha outro; o Adapter é um wrapper com a intenção de converter interface.", "**Are Adapter and Wrapper the same thing?** Wrapper is the generic name for any object that wraps another; Adapter is a wrapper with the intent of converting an interface."],
        ["**Posso ter um adaptador bidirecional?** Sim, quando dois sistemas precisam enxergar um ao outro, mas é raro e traz complexidade.", "**Can I have a two-way adapter?** Yes, when two systems need to see each other, but it is rare and adds complexity."],
        ["**Como testar um adaptador?** Com testes de contrato: dado um Adaptee simulado, a saída do Target está correta; e testes de integração contra o provedor real em ambiente de teste.", "**How do I test an adapter?** With contract tests: given a mocked Adaptee, the Target output is correct; and integration tests against the real provider in a test environment."],
        ["**O adaptador pode ter estado?** Pode, mas prefira que seja sem estado, para ser compartilhado com segurança.", "**Can the adapter have state?** It can, but prefer it stateless so it can be shared safely."],
      ),
      tip(["Regra prática: nomeie o adaptador pela tecnologia que ele esconde (`StripePaymentAdapter`) e a interface alvo pelo conceito do domínio (`PaymentGateway`). Quando a tecnologia mudar, só o primeiro nome muda.", "Rule of thumb: name the adapter after the technology it hides (`StripePaymentAdapter`) and the target interface after the domain concept (`PaymentGateway`). When the technology changes, only the first name changes."]),
    ] },
  { id: "padrao-decorator", section: "lld", level: 1, icon: "layers", minutes: 10,
    title: ["Padrão Decorator", "Decorator pattern"],
    summary: ["Acrescentar comportamento a um objeto em camadas, sem herança: código completo, ordem das camadas e uso em middlewares e streams.", "Adding behavior to an object in layers, without inheritance: complete code, layer order and use in middlewares and streams."],
    body: [
      p(["Suponha um serviço de armazenamento de dados com `write(bytes)`. Depois surgem requisitos: comprimir antes de gravar, criptografar, registrar logs, medir o tempo. Você pode querer qualquer combinação: só compressão, compressão e criptografia, criptografia e log. Com herança, seria preciso uma subclasse para cada combinação (`CompressedStorage`, `EncryptedStorage`, `CompressedEncryptedStorage`, `LoggedCompressedStorage`...), e o número delas explode a cada recurso novo. O padrão **Decorator** (estrutural, GoF) propõe outro caminho: **acrescentar responsabilidades a um objeto dinamicamente**, embrulhando-o em outro objeto que implementa a **mesma interface**, repassa as chamadas ao objeto embrulhado e executa algo antes ou depois. Cada recurso vira uma camada pequena, e as camadas se empilham como se quiser.", "Suppose a data storage service with `write(bytes)`. Then requirements appear: compress before writing, encrypt, log, measure time. You may want any combination: just compression, compression and encryption, encryption and logging. With inheritance, one subclass per combination would be needed (`CompressedStorage`, `EncryptedStorage`, `CompressedEncryptedStorage`, `LoggedCompressedStorage`...), and their number explodes with each new feature. The **Decorator** pattern (structural, GoF) proposes another path: **adding responsibilities to an object dynamically**, by wrapping it in another object that implements the **same interface**, forwards calls to the wrapped object and does something before or after. Each feature becomes a small layer, and the layers stack as you wish."]),
      h(["Estrutura e participantes", "Structure and participants"]),
      ul(
        ["**Component**: a interface comum (`Storage`).", "**Component**: the common interface (`Storage`)."],
        ["**ConcreteComponent**: o objeto original que faz o trabalho básico (`FileStorage`).", "**ConcreteComponent**: the original object doing the basic work (`FileStorage`)."],
        ["**Decorator**: classe base que implementa o Component e guarda uma referência a outro Component (o embrulhado).", "**Decorator**: base class implementing the Component and holding a reference to another Component (the wrapped one)."],
        ["**ConcreteDecorator**: acrescenta o comportamento antes e/ou depois de delegar.", "**ConcreteDecorator**: adds behavior before and/or after delegating."],
      ),
      fig(["Camadas de decoradores em torno do componente", "Layers of decorators around the component"], [
        [node("cl", "Client", "client")],
        [node("lg", "LoggingStorage", "service")],
        [node("en", "EncryptedStorage", "service")],
        [node("co", "CompressedStorage", "service")],
        [node("fs", ["FileStorage (base)", "FileStorage (base)"], "data")],
      ], [edge("cl", "lg", "write()"), edge("lg", "en", ["delega", "delegates"]), edge("en", "co", ["delega", "delegates"]), edge("co", "fs", ["delega", "delegates"])]),
      h(["Implementação em TypeScript", "Implementation in TypeScript"]),
      code(`import { gzipSync } from "node:zlib";

interface Storage { write(name: string, data: Buffer): Promise<void> }

class FileStorage implements Storage {                // concrete component
  async write(name: string, data: Buffer) { /* fs.writeFile(name, data) */ console.log("saved", name, data.length, "bytes"); }
}

abstract class StorageDecorator implements Storage {  // base decorator
  constructor(protected readonly inner: Storage) {}
  write(name: string, data: Buffer) { return this.inner.write(name, data); }   // default: just forward
}

class CompressedStorage extends StorageDecorator {
  write(name: string, data: Buffer) { return this.inner.write(name + ".gz", gzipSync(data)); }
}
class EncryptedStorage extends StorageDecorator {
  constructor(inner: Storage, private encrypt: (b: Buffer) => Buffer) { super(inner); }
  write(name: string, data: Buffer) { return this.inner.write(name, this.encrypt(data)); }
}
class LoggingStorage extends StorageDecorator {
  async write(name: string, data: Buffer) {
    const t0 = Date.now();
    try { await this.inner.write(name, data); }
    finally { console.log("write " + name + " took " + (Date.now() - t0) + "ms"); }
  }
}

// Any combination, chosen at run time. Order matters: compress BEFORE encrypting.
const xor = (b: Buffer) => Buffer.from(b.map((x) => x ^ 0x5a));
let storage: Storage = new FileStorage();
storage = new CompressedStorage(new EncryptedStorage(storage, xor));   // compress first, then encrypt (see note below)
storage = new LoggingStorage(storage);
await storage.write("report", Buffer.from("hello hello hello"));`),
      p(["Atenção à **ordem**. No exemplo, o decorador mais externo é o primeiro a receber a chamada. Se a montagem fosse `Encrypted(Compressed(File))`, os dados seriam criptografados e só depois enviados à compressão, o contrário do desejável, pois dados criptografados são praticamente aleatórios e não comprimem. Para comprimir primeiro e criptografar depois, a montagem correta é `Compressed(Encrypted(File))`, a usada no código. Esse tipo de detalhe é a principal fonte de bugs com decoradores e a razão para testar a composição, não só cada camada.", "Mind the **order**. In the example, the outermost decorator is the first to receive the call. If the assembly were `Encrypted(Compressed(File))`, data would be encrypted and only then sent to compression, the opposite of what is desirable, since encrypted data is practically random and does not compress. To compress first and encrypt afterward, the correct assembly is `Compressed(Encrypted(File))`, the one used in the code. This kind of detail is the main source of bugs with decorators and the reason to test the composition, not just each layer."]),
      h(["Decorator x herança", "Decorator vs inheritance"]),
      table([["Aspecto", "Aspect"], ["Herança", "Inheritance"], ["Decorator", "Decorator"]],
        [["Quando o comportamento é definido", "When behavior is defined"], ["Compilação", "Compile time"], ["Execução", "Run time"]],
        [["Combinações", "Combinations"], ["Uma subclasse por combinação", "One subclass per combination"], ["Empilhar camadas livremente", "Stack layers freely"]],
        [["Adicionar a um objeto isolado", "Adding to a single object"], ["Não: afeta toda a classe", "No: affects the whole class"], ["Sim: só aquela instância", "Yes: only that instance"]],
        [["Acoplamento", "Coupling"], ["Forte com a superclasse", "Strong to the superclass"], ["Fraco, à interface", "Weak, to the interface"]],
        [["Identidade do objeto", "Object identity"], ["O mesmo objeto", "The same object"], ["Objetos diferentes embrulhando o original", "Different objects wrapping the original"]],
      ),
      h(["Decorator x Proxy x Adapter", "Decorator vs Proxy vs Adapter"]),
      p(["Os três embrulham outro objeto, mas com intenções diferentes. O **Adapter** muda a interface. O **Proxy** mantém a interface e *controla o acesso* (cria o objeto sob demanda, verifica permissões, conversa com um objeto remoto); em geral ele é quem *gerencia o ciclo de vida* do objeto real. O **Decorator** mantém a interface e *acrescenta comportamento*, e quem o monta é o cliente, empilhando camadas. Na prática, um cache em frente a um serviço pode ser descrito como Proxy (controla o acesso) ou Decorator (acrescenta cache); o que importa é a clareza da intenção.", "The three wrap another object, but with different intents. **Adapter** changes the interface. **Proxy** keeps the interface and *controls access* (creates the object on demand, checks permissions, talks to a remote object); in general it *manages the lifecycle* of the real object. **Decorator** keeps the interface and *adds behavior*, and the client assembles it by stacking layers. In practice a cache in front of a service can be described as Proxy (controls access) or Decorator (adds caching); what matters is clarity of intent."]),
      h(["Decoradores como funções e a sintaxe de decorators", "Decorators as functions and decorator syntax"]),
      p(["Em linguagens com funções de primeira classe, o padrão frequentemente é uma **função de ordem superior**: recebe uma função e devolve outra com o mesmo contrato e algo a mais. É assim que se escrevem *middlewares* de HTTP, `withRetry`, `withTimeout` e `memoize`. Python tem a sintaxe `@decorator` para isso, e TypeScript/JavaScript tem uma proposta de decorators para classes e métodos. Cuidado com o nome: o *decorator* da linguagem (uma anotação que modifica uma classe ou método) é um mecanismo que pode ser usado para implementar o padrão, mas não é o padrão em si.", "In languages with first-class functions, the pattern is often a **higher-order function**: it receives a function and returns another with the same contract and something extra. This is how HTTP *middlewares*, `withRetry`, `withTimeout` and `memoize` are written. Python has the `@decorator` syntax for this, and TypeScript/JavaScript has a decorators proposal for classes and methods. Beware of the name: the language *decorator* (an annotation that modifies a class or method) is a mechanism that can be used to implement the pattern, but it is not the pattern itself."]),
      code(`type Handler<A, R> = (arg: A) => Promise<R>;

const withLogging = <A, R>(name: string) => (next: Handler<A, R>): Handler<A, R> =>
  async (arg) => { console.log("start " + name); try { return await next(arg); } finally { console.log("end " + name); } };

const withRetry = <A, R>(times: number) => (next: Handler<A, R>): Handler<A, R> =>
  async (arg) => {
    let last: unknown;
    for (let i = 0; i <= times; i++) { try { return await next(arg); } catch (e) { last = e; } }
    throw last;
  };

const withCache = <R>(next: Handler<string, R>): Handler<string, R> => {
  const cache = new Map<string, R>();
  return async (key) => {
    if (cache.has(key)) return cache.get(key)!;
    const v = await next(key); cache.set(key, v); return v;
  };
};

const fetchUser: Handler<string, { id: string }> = async (id) => ({ id });
const robust = withLogging<string, { id: string }>("fetchUser")(withRetry<string, { id: string }>(2)(withCache(fetchUser)));`),
      h(["Vantagens e desvantagens", "Advantages and disadvantages"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Disadvantages"]],
        [["Estende comportamento sem modificar a classe (OCP)", "Extends behavior without modifying the class (OCP)"], ["Muitos objetos pequenos e parecidos, difíceis de enxergar no depurador", "Many small, similar objects, hard to see in the debugger"]],
        [["Evita a explosão de subclasses", "Avoids subclass explosion"], ["A ordem das camadas importa e é fácil de errar", "Layer order matters and is easy to get wrong"]],
        [["Cada decorador tem uma responsabilidade (SRP)", "Each decorator has one responsibility (SRP)"], ["Remover um decorador específico no meio da pilha é difícil", "Removing a specific decorator in the middle of the stack is hard"]],
        [["Composição em tempo de execução, por configuração", "Composition at run time, by configuration"], ["Código que testa tipo concreto (`instanceof`) deixa de funcionar", "Code that checks the concrete type (`instanceof`) stops working"]],
        [["Reuso das camadas entre componentes diferentes", "Reuse of layers across different components"], ["Interfaces largas obrigam o decorador a delegar muitos métodos", "Wide interfaces force the decorator to delegate many methods"]],
      ),
      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      ul(
        ["**Use** quando precisa acrescentar comportamento a objetos individuais, em combinações variáveis, sem alterar suas classes: logging, métricas, cache, retry, compressão, criptografia, autorização, formatação.", "**Use it** when you need to add behavior to individual objects, in variable combinations, without changing their classes: logging, metrics, caching, retry, compression, encryption, authorization, formatting."],
        ["**Use** quando a herança é inviável (a classe é `final`, vem de uma biblioteca ou a hierarquia já é profunda).", "**Use it** when inheritance is not viable (the class is `final`, comes from a library or the hierarchy is already deep)."],
        ["**Evite** quando as camadas precisam conhecer umas às outras, ou quando a ordem é tão sensível que o encadeamento vira uma armadilha: aí uma classe única ou um pipeline explícito é mais claro.", "**Avoid it** when layers need to know each other, or when order is so sensitive that chaining becomes a trap: then a single class or an explicit pipeline is clearer."],
        ["**Evite** quando a interface do Component é grande: cada decorador teria que repassar dezenas de métodos. Prefira interfaces pequenas (ISP).", "**Avoid it** when the Component interface is large: each decorator would need to forward dozens of methods. Prefer small interfaces (ISP)."],
      ),
      h(["Uso real em frameworks e bibliotecas", "Real use in frameworks and libraries"]),
      ul(
        ["**Java I/O**: `new BufferedReader(new InputStreamReader(new FileInputStream(f)))` empilha decoradores; `BufferedInputStream`, `GZIPInputStream` e `DataInputStream` acrescentam buffer, compressão e leitura tipada.", "**Java I/O**: `new BufferedReader(new InputStreamReader(new FileInputStream(f)))` stacks decorators; `BufferedInputStream`, `GZIPInputStream` and `DataInputStream` add buffering, compression and typed reading."],
        ["**Node.js streams**: `pipe` encadeia transformações, como `fs.createReadStream(f).pipe(zlib.createGzip())`, camadas sobre o mesmo contrato de fluxo.", "**Node.js streams**: `pipe` chains transformations, such as `fs.createReadStream(f).pipe(zlib.createGzip())`, layers over the same stream contract."],
        ["**Middlewares** de Express, Koa e ASP.NET Core: cada um recebe a requisição, faz algo e passa adiante; é uma cadeia que se comporta como decoradores empilhados.", "**Middlewares** in Express, Koa and ASP.NET Core: each receives the request, does something and passes it on; it is a chain behaving like stacked decorators."],
        ["**Python**: `@functools.lru_cache`, `@property` e `@login_required` do Django decoram funções.", "**Python**: `@functools.lru_cache`, `@property` and Django's `@login_required` decorate functions."],
        ["**Java Collections**: `Collections.unmodifiableList` e `synchronizedList` decoram uma lista com restrição de escrita e sincronização.", "**Java Collections**: `Collections.unmodifiableList` and `synchronizedList` decorate a list with a write restriction and synchronization."],
        ["**React**: componentes de ordem superior (HOCs) como `connect` e `memo` embrulham componentes.", "**React**: higher-order components (HOCs) such as `connect` and `memo` wrap components."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Esquecer de delegar métodos que não foram decorados, quebrando partes da interface.", "Forgetting to delegate methods that were not decorated, breaking parts of the interface."],
        ["Depender de uma ordem específica sem documentá-la nem testá-la.", "Depending on a specific order without documenting or testing it."],
        ["Mudar o contrato (por exemplo, o decorador lançar erros que o componente original nunca lançaria), violando o princípio de Liskov.", "Changing the contract (for example, the decorator throwing errors the original component never would), violating the Liskov principle."],
        ["Usar decoradores com estado compartilhado entre instâncias sem perceber (um cache global dentro do decorador).", "Using decorators with state shared between instances without noticing (a global cache inside the decorator)."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Decorator embrulha um objeto em outro de mesma interface para acrescentar comportamento em tempo de execução.", "Decorator wraps an object in another with the same interface to add behavior at run time."],
        ["Substitui a explosão de subclasses por camadas combináveis, mas a ordem das camadas precisa de cuidado.", "It replaces subclass explosion with combinable layers, but layer order needs care."],
        ["Em linguagens com funções de primeira classe, aparece como funções de ordem superior e middlewares.", "In languages with first-class functions, it appears as higher-order functions and middlewares."],
        ["Diferencie de Adapter (muda a interface) e Proxy (controla o acesso).", "Tell it apart from Adapter (changes the interface) and Proxy (controls access)."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Decorator é igual a herança?** Cumpre um papel parecido (estender comportamento), mas por composição e em tempo de execução, com combinação livre.", "**Is Decorator the same as inheritance?** It plays a similar role (extending behavior), but via composition and at run time, with free combination."],
        ["**Os decorators do TypeScript e Python são o padrão Decorator?** São um recurso da linguagem que facilita implementá-lo, mas o padrão é a ideia estrutural de embrulhar com a mesma interface.", "**Are TypeScript and Python decorators the Decorator pattern?** They are a language feature that makes it easier to implement it, but the pattern is the structural idea of wrapping with the same interface."],
        ["**Quantas camadas são demais?** Quando depurar exige abrir cinco níveis de pilha para achar o que acontece, considere um pipeline explícito com nome e ordem visíveis.", "**How many layers are too many?** When debugging requires opening five stack levels to find what happens, consider an explicit pipeline with visible name and order."],
        ["**Decorator e Chain of Responsibility são parecidos?** Estruturalmente sim, mas na cadeia um elo pode interromper e responder; o decorador sempre delega.", "**Are Decorator and Chain of Responsibility similar?** Structurally yes, but in a chain a link can stop and respond; a decorator always delegates."],
      ),
      tip(["Teste sua composição: monte a pilha de decoradores em um teste com um componente falso que registra o que recebeu. Assim a ordem fica documentada e protegida contra regressões.", "Test your composition: assemble the decorator stack in a test with a fake component that records what it received. That way the order is documented and protected against regressions."]),
    ] },
  { id: "padrao-facade-e-proxy", section: "lld", level: 1, icon: "door_front", minutes: 11,
    title: ["Padrões Facade e Proxy", "Facade and Proxy patterns"],
    summary: ["Simplificar o acesso a um subsistema (Facade) e controlar o acesso a um objeto (Proxy), com os tipos de proxy, código completo e comparação.", "Simplifying access to a subsystem (Facade) and controlling access to an object (Proxy), with proxy kinds, complete code and comparison."],
    body: [
      p(["Estes dois padrões estruturais costumam ser estudados juntos porque ambos colocam um objeto na frente de outro, mas atendem a necessidades muito diferentes. A **Facade** (fachada) responde ao problema da *complexidade*: um subsistema tem muitas classes, e quem só quer fazer uma tarefa comum precisa conhecer todas elas. O **Proxy** (procurador) responde ao problema do *acesso*: você quer controlar quando, como ou se um objeto é usado, sem que o cliente perceba que há alguém no meio.", "These two structural patterns are often studied together because both put an object in front of another, but they serve very different needs. **Facade** answers the problem of *complexity*: a subsystem has many classes, and whoever just wants to do a common task has to know all of them. **Proxy** answers the problem of *access*: you want to control when, how or whether an object is used, without the client noticing someone is in the middle."]),
      h(["Facade: uma porta simples para um subsistema complexo", "Facade: a simple door to a complex subsystem"]),
      p(["Pense em converter um vídeo: é preciso ler o arquivo, escolher o codec de áudio e de vídeo, ajustar bitrate, multiplexar o contêiner e escrever o resultado. Cada passo é uma classe de uma biblioteca. Quem só quer `converter(arquivo, 'mp4')` não deveria saber de nada disso. A **Facade** é uma classe que oferece uma interface **simplificada e de alto nível** a esse conjunto, orquestrando os objetos internos. Ela *não* esconde o subsistema à força: quem precisa de controle fino pode continuar usando as classes internas diretamente. O objetivo é **reduzir o acoplamento** entre o cliente e as muitas peças.", "Think of converting a video: you must read the file, choose the audio and video codec, adjust bitrate, mux the container and write the result. Each step is a class from a library. Whoever just wants `convert(file, 'mp4')` should not know any of this. A **Facade** is a class that offers a **simplified, high-level interface** to this set, orchestrating the internal objects. It does *not* forcibly hide the subsystem: whoever needs fine control can still use the inner classes directly. The goal is to **reduce coupling** between the client and the many pieces."]),
      fig(["Facade: o cliente fala com uma classe, ela orquestra o subsistema", "Facade: the client talks to one class, which orchestrates the subsystem"], [
        [node("cl", "Client", "client")],
        [node("fa", "OrderFacade", "service")],
        [node("inv", "Inventory", "data"), node("pay", "Payments", "ext"), node("shp", "Shipping", "ext"), node("ntf", "Notifications", "queue")],
      ], [edge("cl", "fa", "placeOrder()"), edge("fa", "inv"), edge("fa", "pay"), edge("fa", "shp"), edge("fa", "ntf")]),
      code(`// Subsystem: each class is useful on its own
class Inventory { reserve(sku: string, qty: number): boolean { return true; } release(sku: string, qty: number) {} }
class Payments { charge(customer: string, amount: number): string { return "tx-1"; } refund(tx: string) {} }
class Shipping { schedule(customer: string, sku: string): string { return "ship-9"; } }
class Notifications { send(customer: string, text: string) { console.log(customer, text); } }

// Facade: one high-level operation hides the orchestration (and the compensations on failure)
class OrderFacade {
  constructor(
    private inv: Inventory, private pay: Payments,
    private ship: Shipping, private notify: Notifications,
  ) {}

  placeOrder(customer: string, sku: string, qty: number, price: number): { tx: string; shipment: string } {
    if (!this.inv.reserve(sku, qty)) throw new Error("out of stock");
    let tx: string;
    try { tx = this.pay.charge(customer, price * qty); }
    catch (e) { this.inv.release(sku, qty); throw e; }          // compensation
    const shipment = this.ship.schedule(customer, sku);
    this.notify.send(customer, "Order confirmed: " + shipment);
    return { tx, shipment };
  }
}
const facade = new OrderFacade(new Inventory(), new Payments(), new Shipping(), new Notifications());
facade.placeOrder("ana", "A-1", 2, 49.9);`),
      p(["Benefícios: o cliente tem **um** ponto de entrada, as dependências do subsistema não vazam e a lógica de orquestração fica em um só lugar, testável. Riscos: a fachada pode virar um **objeto-deus** que sabe demais; para evitar, mantenha-a fina (só coordena, não decide regras de negócio) e crie várias fachadas pequenas por caso de uso, em vez de uma gigante. Em arquitetura, a mesma ideia aparece como *serviços de aplicação* e como o **API Gateway** na frente de microsserviços.", "Benefits: the client has **one** entry point, the subsystem's dependencies do not leak and orchestration logic lives in one testable place. Risks: the facade can become a **god object** that knows too much; to avoid this, keep it thin (it only coordinates, does not decide business rules) and create several small facades per use case instead of a giant one. In architecture, the same idea appears as *application services* and as the **API Gateway** in front of microservices."]),
      h(["Proxy: um substituto que controla o acesso", "Proxy: a stand-in that controls access"]),
      p(["O **Proxy** fornece um **substituto ou representante** de outro objeto (o *sujeito real*), com **a mesma interface**, para controlar o acesso a ele. O cliente fala com o proxy como se fosse o objeto real; o proxy decide se, quando e como repassar a chamada, e pode fazer algo antes ou depois. Como a interface é a mesma, o proxy pode ser inserido sem mudar o cliente. Os participantes são: **Subject** (a interface comum), **RealSubject** (o objeto real) e **Proxy** (guarda uma referência ao real e controla o acesso).", "**Proxy** provides a **substitute or representative** for another object (the *real subject*), with **the same interface**, to control access to it. The client talks to the proxy as if it were the real object; the proxy decides whether, when and how to forward the call, and may do something before or after. Because the interface is the same, the proxy can be inserted without changing the client. The participants are: **Subject** (the common interface), **RealSubject** (the real object) and **Proxy** (holds a reference to the real one and controls access)."]),
      fig(["Estrutura do Proxy", "Proxy structure"], [
        [node("cl", "Client", "client")],
        [node("su", ["«interface» ImageService", "«interface» ImageService"], "edge")],
        [node("px", "ImageProxy", "service")],
        [node("rs", ["RealImageService", "RealImageService"], "data")],
      ], [edge("cl", "su", ["usa", "uses"]), edge("px", "su", "", { dashed: true }), edge("rs", "su", "", { dashed: true }), edge("px", "rs", ["controla e delega", "controls and delegates"])]),
      h(["Tipos de proxy", "Kinds of proxy"]),
      table([["Tipo", "Kind"], ["O que controla", "What it controls"], ["Exemplo", "Example"]],
        [["Virtual", "Virtual"], ["Adia a criação de um objeto caro até o primeiro uso (*lazy loading*)", "Delays creating an expensive object until first use (*lazy loading*)"], ["Imagem grande só é carregada quando exibida; relações preguiçosas em ORMs", "A large image only loads when displayed; lazy relations in ORMs"]],
        [["Proteção", "Protection"], ["Verifica permissões antes de repassar", "Checks permissions before forwarding"], ["Só admins chamam `deleteUser`", "Only admins call `deleteUser`"]],
        [["Remoto", "Remote"], ["Representa localmente um objeto em outro processo ou máquina", "Represents locally an object in another process or machine"], ["Stub gerado por gRPC, RMI ou um cliente de API que parece uma classe local", "gRPC stub, RMI or an API client that looks like a local class"]],
        [["Cache", "Caching"], ["Guarda resultados e evita repetir chamadas caras", "Stores results and avoids repeating expensive calls"], ["Proxy de cache em frente a um serviço lento", "Cache proxy in front of a slow service"]],
        [["Registro (logging)", "Logging"], ["Registra chamadas, tempo e argumentos", "Records calls, time and arguments"], ["Auditoria de acesso a dados sensíveis", "Auditing access to sensitive data"]],
        [["Referência inteligente", "Smart reference"], ["Conta referências, libera recursos, controla concorrência", "Counts references, frees resources, controls concurrency"], ["`shared_ptr` do C++, travas por objeto", "C++ `shared_ptr`, per-object locks"]],
      ),
      h(["Exemplo: proxy virtual, de proteção e de cache", "Example: virtual, protection and caching proxies"]),
      code(`interface ReportService { generate(userId: string, month: string): Promise<string> }

class RealReportService implements ReportService {   // slow and expensive
  async generate(userId: string, month: string) {
    await new Promise((r) => setTimeout(r, 2000));      // simulating heavy work
    return "report for " + userId + " in " + month;
  }
}

// Protection proxy: authorizes before delegating
class AuthorizedReportProxy implements ReportService {
  constructor(private real: ReportService, private canRead: (caller: string, target: string) => boolean, private caller: string) {}
  async generate(userId: string, month: string) {
    if (!this.canRead(this.caller, userId)) throw new Error("forbidden");
    return this.real.generate(userId, month);
  }
}

// Caching proxy: repeats become instant
class CachedReportProxy implements ReportService {
  private cache = new Map<string, Promise<string>>();
  constructor(private real: ReportService) {}
  generate(userId: string, month: string) {
    const key = userId + ":" + month;
    let hit = this.cache.get(key);
    if (!hit) { hit = this.real.generate(userId, month); this.cache.set(key, hit); }
    return hit;
  }
}

// Virtual proxy: the real service is created only on first use
class LazyReportProxy implements ReportService {
  private real?: ReportService;
  constructor(private factory: () => ReportService) {}
  generate(userId: string, month: string) {
    this.real ??= this.factory();
    return this.real.generate(userId, month);
  }
}

const service: ReportService = new AuthorizedReportProxy(
  new CachedReportProxy(new LazyReportProxy(() => new RealReportService())),
  (caller, target) => caller === target, "u1");
await service.generate("u1", "2025-06");`),
      p(["O exemplo mostra que proxies se compõem: autorização, cache e criação preguiçosa em camadas, como decoradores. Em JavaScript, o objeto embutido **`Proxy`** permite interceptar leituras, escritas e chamadas de qualquer objeto de forma genérica, base de sistemas de reatividade (Vue 3 usa isso) e de validação.", "The example shows that proxies compose: authorization, caching and lazy creation in layers, like decorators. In JavaScript, the built-in **`Proxy`** object lets you intercept reads, writes and calls on any object generically, the basis of reactivity systems (Vue 3 uses it) and validation."]),
      code(`// JavaScript Proxy: generic logging proxy for any object
function logged<T extends object>(target: T): T {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver);
      if (typeof value !== "function") return value;
      return (...args: unknown[]) => { console.log("call " + String(prop), args); return value.apply(obj, args); };
    },
  });
}
const calc = logged({ add: (a: number, b: number) => a + b });
calc.add(2, 3);   // logs: call add [ 2, 3 ]`),
      h(["Facade x Proxy x Adapter x Decorator", "Facade vs Proxy vs Adapter vs Decorator"]),
      table([["Padrão", "Pattern"], ["Interface em relação ao objeto embrulhado", "Interface relative to the wrapped object"], ["Intenção", "Intent"]],
        [["Facade", "Facade"], ["Nova, mais simples, cobrindo vários objetos", "New, simpler, covering several objects"], ["Reduzir complexidade e acoplamento", "Reduce complexity and coupling"]],
        [["Proxy", "Proxy"], ["Idêntica, com um único objeto real", "Identical, with a single real object"], ["Controlar o acesso (lazy, segurança, rede, cache)", "Control access (lazy, security, network, cache)"]],
        [["Adapter", "Adapter"], ["Diferente da esperada pelo cliente", "Different from what the client expects"], ["Compatibilizar interfaces", "Reconcile interfaces"]],
        [["Decorator", "Decorator"], ["Idêntica", "Identical"], ["Acrescentar comportamento", "Add behavior"]],
      ),
      h(["Vantagens e desvantagens", "Advantages and disadvantages"]),
      table([["Padrão", "Pattern"], ["Vantagens", "Advantages"], ["Desvantagens", "Disadvantages"]],
        [["Facade", "Facade"], ["Interface simples; isola o cliente do subsistema; centraliza a orquestração", "Simple interface; isolates the client from the subsystem; centralizes orchestration"], ["Pode virar objeto-deus; cria mais um nível de indireção", "Can become a god object; adds one more level of indirection"]],
        [["Proxy", "Proxy"], ["Controle transparente de acesso; permite lazy loading, segurança e cache sem mudar o cliente ou o objeto real", "Transparent access control; enables lazy loading, security and caching without changing the client or the real object"], ["Latência extra; pode esconder custos e falhas (em proxies remotos, a rede falha); mais classes", "Extra latency; may hide costs and failures (in remote proxies, the network fails); more classes"]],
      ),
      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      ul(
        ["**Facade, use** para oferecer uma API simples sobre bibliotecas complicadas, para dividir um sistema em camadas (cada camada expõe uma fachada) e para encapsular fluxos que sempre envolvem os mesmos passos.", "**Facade, use it** to offer a simple API over complicated libraries, to split a system into layers (each layer exposes a facade) and to encapsulate flows that always involve the same steps."],
        ["**Facade, evite** quando o subsistema já é simples, ou quando os clientes precisam, na maior parte do tempo, de controle fino que a fachada esconderia.", "**Facade, avoid it** when the subsystem is already simple, or when clients mostly need fine control that the facade would hide."],
        ["**Proxy, use** para carregamento preguiçoso, controle de acesso, cache transparente, representar recursos remotos e instrumentar chamadas.", "**Proxy, use it** for lazy loading, access control, transparent caching, representing remote resources and instrumenting calls."],
        ["**Proxy, evite** quando o comportamento extra pertence ao próprio objeto, ou quando a transparência é enganosa: uma chamada de rede que parece local esconde falhas e latência (veja as falácias da computação distribuída).", "**Proxy, avoid it** when the extra behavior belongs to the object itself, or when transparency is misleading: a network call that looks local hides failures and latency (see the fallacies of distributed computing)."],
      ),
      h(["Uso real em frameworks e bibliotecas", "Real use in frameworks and libraries"]),
      ul(
        ["**Facade**: jQuery em relação ao DOM; `Files` e `Paths` do Java NIO sobre APIs de arquivos; bibliotecas de cliente de SDK de nuvem que ocultam autenticação, retentativas e paginação; `SLF4J` como fachada de logging.", "**Facade**: jQuery over the DOM; Java NIO's `Files` and `Paths` over file APIs; cloud SDK client libraries that hide authentication, retries and pagination; `SLF4J` as a logging facade."],
        ["**Proxy**: o Spring cria proxies dinâmicos para `@Transactional`, `@Cacheable` e segurança; o Hibernate usa proxies para relações preguiçosas; o Vue 3 usa `Proxy` para reatividade; Nginx e Envoy atuam como proxies reversos em escala de sistema.", "**Proxy**: Spring creates dynamic proxies for `@Transactional`, `@Cacheable` and security; Hibernate uses proxies for lazy relations; Vue 3 uses `Proxy` for reactivity; Nginx and Envoy act as reverse proxies at system scale."],
        ["**RPC**: o *stub* de cliente gerado por gRPC é um proxy remoto: chamar `client.getUser(id)` parece uma chamada local, mas atravessa a rede.", "**RPC**: the client *stub* generated by gRPC is a remote proxy: calling `client.getUser(id)` looks local but crosses the network."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Fachada com regras de negócio dentro, em vez de apenas orquestrar.", "A facade with business rules inside instead of just orchestrating."],
        ["Fachada que exige que todo código passe por ela, impedindo usos legítimos do subsistema.", "A facade that requires all code to go through it, preventing legitimate uses of the subsystem."],
        ["Proxy que altera o contrato (devolve algo diferente do objeto real), quebrando a substituição.", "A proxy that changes the contract (returns something different from the real object), breaking substitution."],
        ["Proxy de cache sem estratégia de invalidação, que devolve dados velhos para sempre.", "A caching proxy without an invalidation strategy, which returns stale data forever."],
        ["Esquecer a segurança de threads em proxies virtuais (duas threads criando o objeto real ao mesmo tempo).", "Forgetting thread safety in virtual proxies (two threads creating the real object at the same time)."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Facade oferece uma interface simples e nova a um subsistema com muitas classes.", "Facade offers a simple, new interface to a subsystem with many classes."],
        ["Proxy mantém a interface do objeto real e controla o acesso: virtual, proteção, remoto, cache e log.", "Proxy keeps the real object's interface and controls access: virtual, protection, remote, cache and log."],
        ["Os dois embrulham outros objetos, mas a intenção os separa de Adapter e Decorator.", "Both wrap other objects, but intent separates them from Adapter and Decorator."],
        ["Mantenha a fachada fina e o proxy transparente em contrato, sem esconder falhas de rede.", "Keep the facade thin and the proxy contract-transparent, without hiding network failures."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Um API Gateway é uma Facade?** Em essência, sim: uma interface única na frente de vários serviços, que pode agregar chamadas e simplificar o cliente.", "**Is an API Gateway a Facade?** In essence, yes: a single interface in front of several services, which can aggregate calls and simplify the client."],
        ["**Proxy e proxy reverso são a mesma coisa?** Têm a mesma ideia (intermediar o acesso), mas em escalas diferentes: o padrão atua em objetos; o proxy reverso, em servidores e rede.", "**Are Proxy and reverse proxy the same thing?** They share the idea (mediating access), but at different scales: the pattern acts on objects; the reverse proxy on servers and network."],
        ["**A Facade impede de usar o subsistema diretamente?** Não, ela é um atalho; o acesso direto continua possível, a menos que você decida restringi-lo.", "**Does Facade prevent using the subsystem directly?** No, it is a shortcut; direct access remains possible unless you decide to restrict it."],
        ["**Proxy e Decorator podem coexistir?** Sim, e é comum empilhá-los: autorização, cache e logging em camadas.", "**Can Proxy and Decorator coexist?** Yes, and stacking them is common: authorization, caching and logging in layers."],
      ),
      tip(["Para escolher entre os dois: se o objetivo é *facilitar o uso* de várias coisas, é Facade; se é *controlar o acesso* a uma coisa sem que ninguém perceba, é Proxy.", "To choose between the two: if the goal is *making many things easier to use*, it is a Facade; if it is *controlling access* to one thing without anyone noticing, it is a Proxy."]),
    ] },
  { id: "padrao-strategy", section: "lld", level: 1, icon: "alt_route", minutes: 10,
    title: ["Padrão Strategy", "Strategy pattern"],
    summary: ["Encapsular algoritmos intercambiáveis atrás de uma interface: código completo, versão com funções, Strategy x State e uso real.", "Encapsulating interchangeable algorithms behind an interface: complete code, function version, Strategy vs State and real use."],
    body: [
      p(["Quase todo sistema tem pontos em que existem **várias maneiras de fazer a mesma coisa**: calcular o frete (correios, transportadora, retirada), ordenar uma lista (por nome, por data, por preço), comprimir um arquivo (gzip, zstd), validar um pagamento (cartão, pix, boleto), calcular o preço de um estacionamento (por hora, diária, plano mensal). A primeira solução costuma ser um `if/else` ou um `switch` dentro da classe. Funciona, até crescer: a classe passa a conhecer todos os algoritmos, ganha dezenas de linhas por variante, cada novo caso obriga a editá-la e testá-la inteira (violação do aberto/fechado), e não dá para escolher o algoritmo em tempo de execução por configuração sem mais condicionais.", "Almost every system has points where there are **several ways of doing the same thing**: computing shipping (postal service, carrier, pickup), sorting a list (by name, date, price), compressing a file (gzip, zstd), validating a payment (card, instant transfer, slip), computing a parking price (hourly, daily, monthly plan). The first solution is usually an `if/else` or a `switch` inside the class. It works until it grows: the class comes to know all algorithms, gains dozens of lines per variant, every new case forces editing and retesting the whole thing (open/closed violation), and the algorithm cannot be chosen at run time by configuration without more conditionals."]),
      p(["O padrão **Strategy** (comportamental, GoF) define uma **família de algoritmos**, encapsula cada um em uma classe própria com a mesma interface e os torna **intercambiáveis**. A classe que precisa do algoritmo (o *contexto*) guarda uma referência à interface e delega a ela; quem decide qual estratégia usar é o cliente ou a configuração, e pode trocar a qualquer momento.", "The **Strategy** pattern (behavioral, GoF) defines a **family of algorithms**, encapsulates each one in its own class with the same interface and makes them **interchangeable**. The class that needs the algorithm (the *context*) holds a reference to the interface and delegates to it; whoever decides which strategy to use is the client or configuration, and can swap it at any time."]),
      h(["Estrutura e participantes", "Structure and participants"]),
      ul(
        ["**Strategy**: a interface comum a todos os algoritmos (`ShippingStrategy.cost(order)`).", "**Strategy**: the interface common to all algorithms (`ShippingStrategy.cost(order)`)."],
        ["**ConcreteStrategy**: cada algoritmo (`PostalShipping`, `CarrierShipping`, `Pickup`).", "**ConcreteStrategy**: each algorithm (`PostalShipping`, `CarrierShipping`, `Pickup`)."],
        ["**Context**: usa uma Strategy e expõe um método para configurá-la; não conhece os detalhes dos algoritmos.", "**Context**: uses a Strategy and exposes a way to configure it; it does not know the algorithms' details."],
        ["**Client**: escolhe a estratégia concreta e a entrega ao contexto.", "**Client**: chooses the concrete strategy and hands it to the context."],
      ),
      fig(["Estrutura do Strategy", "Strategy structure"], [
        [node("cl", "Client", "client")],
        [node("cx", ["Context (Checkout)", "Context (Checkout)"], "service")],
        [node("st", ["«interface» ShippingStrategy", "«interface» ShippingStrategy"], "edge")],
        [node("s1", "PostalShipping", "data"), node("s2", "CarrierShipping", "data"), node("s3", "PickupInStore", "data")],
      ], [edge("cl", "cx", ["configura", "configures"]), edge("cx", "st", ["delega", "delegates"]), edge("s1", "st", "", { dashed: true }), edge("s2", "st", "", { dashed: true }), edge("s3", "st", "", { dashed: true })]),
      h(["Antes e depois", "Before and after"]),
      code(`// BEFORE: the Checkout knows every shipping rule
class CheckoutBad {
  total(items: number[], method: "postal" | "carrier" | "pickup", weightKg: number): number {
    const subtotal = items.reduce((a, b) => a + b, 0);
    let shipping = 0;
    if (method === "postal") shipping = 10 + weightKg * 2;
    else if (method === "carrier") shipping = Math.max(15, weightKg * 3.5);
    else if (method === "pickup") shipping = 0;
    return subtotal + shipping;                    // every new method edits this class
  }
}

// AFTER: each rule is a class behind one interface
interface ShippingStrategy { cost(weightKg: number): number }
class PostalShipping implements ShippingStrategy { cost(w: number) { return 10 + w * 2; } }
class CarrierShipping implements ShippingStrategy { cost(w: number) { return Math.max(15, w * 3.5); } }
class PickupInStore implements ShippingStrategy { cost() { return 0; } }

class Checkout {
  constructor(private shipping: ShippingStrategy) {}
  setShipping(s: ShippingStrategy) { this.shipping = s; }          // swap at run time
  total(items: number[], weightKg: number): number {
    return items.reduce((a, b) => a + b, 0) + this.shipping.cost(weightKg);
  }
}

const checkout = new Checkout(new PostalShipping());
console.log(checkout.total([50, 30], 2));     // 94
checkout.setShipping(new PickupInStore());
console.log(checkout.total([50, 30], 2));     // 80`),
      p(["Adicionar `ExpressDroneShipping` agora significa criar uma classe nova e escolher onde ela é instanciada; `Checkout` não muda. Cada estratégia é testável isoladamente, e o próprio `Checkout` pode ser testado com uma estratégia falsa que devolve um valor fixo.", "Adding `ExpressDroneShipping` now means creating a new class and choosing where it is instantiated; `Checkout` does not change. Each strategy is testable in isolation, and `Checkout` itself can be tested with a fake strategy that returns a fixed value."]),
      h(["Strategy com funções e registro de estratégias", "Strategy with functions and a strategy registry"]),
      p(["Quando a interface tem **um único método**, a classe é só cerimônia. Em linguagens com funções de primeira classe, a estratégia é simplesmente uma função, e o contexto recebe a função por parâmetro. Isso aparece em `Array.prototype.sort(compareFn)`, `Comparator` do Java 8 em diante e `sorted(key=...)` do Python. Uma técnica comum é guardar as estratégias em um **mapa** e escolhê-las por chave de configuração, o que combina Strategy com uma Simple Factory.", "When the interface has **a single method**, the class is just ceremony. In languages with first-class functions, the strategy is simply a function, and the context receives the function as a parameter. This shows up in `Array.prototype.sort(compareFn)`, Java 8's `Comparator` and Python's `sorted(key=...)`. A common technique is to keep strategies in a **map** and choose them by configuration key, which combines Strategy with a Simple Factory."]),
      code(`type PricingRule = (basePrice: number, quantity: number) => number;

const rules: Record<string, PricingRule> = {
  regular: (p, q) => p * q,
  bulk: (p, q) => (q >= 10 ? p * q * 0.9 : p * q),
  buy2pay1: (p, q) => p * (q - Math.floor(q / 3)),
};

function price(ruleName: keyof typeof rules, base: number, qty: number) {
  const rule = rules[ruleName];                 // strategy chosen by configuration
  if (!rule) throw new Error("unknown rule " + ruleName);
  return rule(base, qty);
}

// Sorting is Strategy in the standard library
const people = [{ n: "Ana", age: 30 }, { n: "Bia", age: 25 }];
people.sort((a, b) => a.age - b.age);           // the comparator is the strategy`),
      h(["Strategy x State x Template Method", "Strategy vs State vs Template Method"]),
      p(["Strategy e **State** têm estruturas quase idênticas (um contexto que delega a um objeto trocável), mas intenções diferentes. No Strategy, o *cliente* escolhe o algoritmo e as estratégias não se conhecem; elas são alternativas independentes. No State, o *próprio contexto* troca o objeto à medida que seu estado muda, e os estados geralmente conhecem uns aos outros e as transições entre eles. **Template Method** também varia partes de um algoritmo, mas por *herança*, definida em tempo de compilação; Strategy varia o algoritmo todo por *composição*, em tempo de execução.", "Strategy and **State** have almost identical structures (a context delegating to a swappable object) but different intents. In Strategy, the *client* chooses the algorithm and strategies do not know each other; they are independent alternatives. In State, the *context itself* swaps the object as its state changes, and states usually know each other and the transitions between them. **Template Method** also varies parts of an algorithm, but through *inheritance*, defined at compile time; Strategy varies the whole algorithm through *composition*, at run time."]),
      table([["Aspecto", "Aspect"], ["Strategy", "Strategy"], ["State", "State"], ["Template Method", "Template Method"]],
        [["Quem decide a variante", "Who decides the variant"], ["O cliente ou a configuração", "The client or configuration"], ["O contexto, conforme as transições", "The context, according to transitions"], ["A subclasse escolhida", "The chosen subclass"]],
        [["Mecanismo", "Mechanism"], ["Composição", "Composition"], ["Composição", "Composition"], ["Herança", "Inheritance"]],
        [["Troca em execução", "Run-time swap"], ["Sim, por escolha externa", "Yes, by external choice"], ["Sim, automática", "Yes, automatic"], ["Não", "No"]],
        [["Granularidade", "Granularity"], ["Algoritmo inteiro", "Whole algorithm"], ["Comportamento por estado", "Behavior per state"], ["Passos do algoritmo", "Steps of the algorithm"]],
      ),
      h(["Vantagens e desvantagens", "Advantages and disadvantages"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Disadvantages"]],
        [["Elimina condicionais longas e respeita o aberto/fechado", "Removes long conditionals and respects open/closed"], ["Mais classes e objetos para poucos algoritmos", "More classes and objects for a few algorithms"]],
        [["Algoritmos testáveis isoladamente e reutilizáveis", "Algorithms testable in isolation and reusable"], ["O cliente precisa conhecer as estratégias para escolher a certa", "The client must know the strategies to pick the right one"]],
        [["Troca em tempo de execução e por configuração", "Swap at run time and by configuration"], ["Se os algoritmos precisam de dados diferentes do contexto, a interface fica inchada", "If algorithms need different data from the context, the interface gets bloated"]],
        [["Substitui herança por composição", "Replaces inheritance with composition"], ["Em linguagens com funções, uma classe por estratégia é exagero", "In languages with functions, one class per strategy is overkill"]],
      ),
      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      ul(
        ["**Use** quando há várias variantes de um algoritmo que provavelmente aumentarão, quando a escolha depende de configuração, do usuário ou do contexto, e quando a mesma lógica condicional aparece em mais de um lugar.", "**Use it** when there are several variants of an algorithm that will probably grow, when the choice depends on configuration, the user or context, and when the same conditional logic appears in more than one place."],
        ["**Use** para isolar algoritmos que mudam por motivos diferentes do contexto (regras fiscais, de preço, de recomendação).", "**Use it** to isolate algorithms that change for reasons different from the context's (tax, pricing, recommendation rules)."],
        ["**Evite** quando há duas variantes estáveis: um `if` simples é mais claro.", "**Avoid it** when there are two stable variants: a simple `if` is clearer."],
        ["**Evite** quando o algoritmo nunca vai variar em tempo de execução: uma função comum já resolve.", "**Avoid it** when the algorithm will never vary at run time: an ordinary function already solves it."],
        ["**Cuidado** com estratégias que dependem de muito estado do contexto: considere passar um objeto de dados bem definido em vez de expor o contexto inteiro.", "**Beware** of strategies that depend on much of the context's state: consider passing a well-defined data object instead of exposing the whole context."],
      ),
      h(["Uso real em frameworks e bibliotecas", "Real use in frameworks and libraries"]),
      ul(
        ["**Ordenação**: `Comparator` em Java, `sort(compareFn)` em JavaScript e `key=` em Python.", "**Sorting**: `Comparator` in Java, `sort(compareFn)` in JavaScript and `key=` in Python."],
        ["**Passport.js**: cada método de login (local, Google, GitHub) é uma *strategy* registrada pelo nome.", "**Passport.js**: each login method (local, Google, GitHub) is a *strategy* registered by name."],
        ["**Spring**: `PasswordEncoder` (BCrypt, Argon2), `ResourceLoader` e `TaskExecutor` são interfaces com implementações trocáveis por configuração.", "**Spring**: `PasswordEncoder` (BCrypt, Argon2), `ResourceLoader` and `TaskExecutor` are interfaces with implementations swappable by configuration."],
        ["**Balanceadores de carga**: round robin, menos conexões e hashing consistente são estratégias de escolha de servidor intercambiáveis.", "**Load balancers**: round robin, least connections and consistent hashing are interchangeable server-selection strategies."],
        ["**Caches**: políticas de remoção (LRU, LFU, FIFO) são estratégias plugáveis na maioria das bibliotecas.", "**Caches**: eviction policies (LRU, LFU, FIFO) are pluggable strategies in most libraries."],
        ["**Java Collections e `java.util.zip`**: níveis e estratégias de compressão configuráveis.", "**Java Collections and `java.util.zip`**: configurable compression levels and strategies."],
      ),
      code(`// Pluggable eviction policy: a classic Strategy in cache design
interface EvictionPolicy { onAccess(key: string): void; onInsert(key: string): void; victim(): string | undefined; remove(key: string): void }
class LruPolicy implements EvictionPolicy {
  private order = new Set<string>();
  onAccess(k: string) { this.order.delete(k); this.order.add(k); }
  onInsert(k: string) { this.onAccess(k); }
  victim() { return this.order.values().next().value; }          // least recently used first
  remove(k: string) { this.order.delete(k); }
}
class Cache<V> {
  private data = new Map<string, V>();
  constructor(private capacity: number, private policy: EvictionPolicy) {}
  get(k: string) { if (this.data.has(k)) this.policy.onAccess(k); return this.data.get(k); }
  put(k: string, v: V) {
    if (!this.data.has(k) && this.data.size >= this.capacity) {
      const v0 = this.policy.victim(); if (v0 !== undefined) { this.data.delete(v0); this.policy.remove(v0); }
    }
    this.data.set(k, v); this.policy.onInsert(k);
  }
}`),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Criar estratégias que compartilham muito código copiado em vez de extrair o trecho comum para uma função ou classe de apoio.", "Creating strategies that share much copied code instead of extracting the common part into a helper function or class."],
        ["Colocar a escolha da estratégia (`switch`) dentro do contexto, reintroduzindo o problema original.", "Putting the strategy choice (`switch`) inside the context, reintroducing the original problem."],
        ["Estratégias com estado mutável compartilhado entre contextos, causando bugs de concorrência.", "Strategies with mutable state shared between contexts, causing concurrency bugs."],
        ["Interfaces de estratégia com muitos métodos, em que cada implementação usa só alguns (viola ISP).", "Strategy interfaces with many methods, where each implementation uses only a few (violates ISP)."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Strategy encapsula algoritmos intercambiáveis atrás de uma interface e os injeta no contexto.", "Strategy encapsulates interchangeable algorithms behind an interface and injects them into the context."],
        ["Substitui condicionais longas, respeita aberto/fechado e permite trocar em tempo de execução.", "It replaces long conditionals, respects open/closed and allows swapping at run time."],
        ["Em linguagens com funções, a estratégia pode ser apenas uma função ou um mapa de funções.", "In languages with functions, the strategy can be just a function or a map of functions."],
        ["Difere de State (quem decide a troca) e de Template Method (composição x herança).", "It differs from State (who decides the swap) and Template Method (composition vs inheritance)."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Strategy e injeção de dependências são a mesma coisa?** São complementares: a DI é um mecanismo para entregar uma estratégia ao contexto, escolhida por configuração.", "**Are Strategy and dependency injection the same thing?** They are complementary: DI is a mechanism to deliver a strategy to the context, chosen by configuration."],
        ["**Posso usar Strategy com enums?** Sim: em linguagens como Java, cada constante do enum pode implementar o método de estratégia, o que dá uma forma compacta para um conjunto fechado.", "**Can I use Strategy with enums?** Yes: in languages such as Java, each enum constant can implement the strategy method, giving a compact form for a closed set."],
        ["**Como escolher a estratégia certa em tempo de execução?** Com uma fábrica ou um mapa chaveado por configuração, preferências do usuário ou características da entrada.", "**How to choose the right strategy at run time?** With a factory or a map keyed by configuration, user preferences or input characteristics."],
        ["**Estratégias podem ser combinadas?** Sim, via Composite (várias regras aplicadas em sequência) ou Decorator (descontos empilhados).", "**Can strategies be combined?** Yes, via Composite (several rules applied in sequence) or Decorator (stacked discounts)."],
      ),
      tip(["Sinal de alerta de que precisa de Strategy: o mesmo `switch` sobre o mesmo tipo aparece em dois ou mais lugares. Troque os dois por uma interface.", "Warning sign that you need Strategy: the same `switch` over the same type appears in two or more places. Replace both with an interface."]),
    ] },
  { id: "padrao-observer", section: "lld", level: 1, icon: "notifications_active", minutes: 11,
    title: ["Padrão Observer", "Observer pattern"],
    summary: ["Notificar vários interessados quando algo muda: modelos push e pull, código completo tipado, eventos assíncronos e armadilhas de memória.", "Notifying several interested parties when something changes: push and pull models, complete typed code, async events and memory pitfalls."],
    body: [
      p(["Em uma loja online, quando o status de um pedido muda para *pago*, várias coisas precisam acontecer: enviar um e-mail, atualizar o estoque, avisar a transportadora, registrar uma métrica, atualizar a tela do cliente. Se a classe `Order` chamar todas essas operações diretamente, ela passa a conhecer e depender de cada uma, e cada nova reação exige editá-la. O padrão **Observer** (comportamental, GoF), também conhecido como **Publish-Subscribe** em sua forma mais ampla, define uma **dependência um-para-muitos**: quando o objeto observado (o **Subject**, ou *publisher*) muda de estado, todos os seus dependentes (os **Observers**, ou *subscribers*) são **notificados e atualizados automaticamente**, sem que o Subject precise conhecê-los de forma concreta.", "In an online store, when an order's status changes to *paid*, several things must happen: send an email, update stock, notify the carrier, record a metric, update the customer's screen. If the `Order` class calls all these operations directly, it comes to know and depend on each one, and every new reaction requires editing it. The **Observer** pattern (behavioral, GoF), also known as **Publish-Subscribe** in its broader form, defines a **one-to-many dependency**: when the observed object (the **Subject**, or *publisher*) changes state, all its dependents (the **Observers**, or *subscribers*) are **notified and updated automatically**, without the Subject needing to know them concretely."]),
      h(["Estrutura e participantes", "Structure and participants"]),
      ul(
        ["**Subject**: mantém a lista de observadores e oferece `subscribe`, `unsubscribe` e `notify`.", "**Subject**: keeps the list of observers and offers `subscribe`, `unsubscribe` and `notify`."],
        ["**Observer**: a interface com o método que o subject chama (`update` ou `onEvent`).", "**Observer**: the interface with the method the subject calls (`update` or `onEvent`)."],
        ["**ConcreteSubject**: guarda o estado interessante e chama `notify` quando ele muda.", "**ConcreteSubject**: holds the interesting state and calls `notify` when it changes."],
        ["**ConcreteObserver**: reage à notificação do seu jeito.", "**ConcreteObserver**: reacts to the notification in its own way."],
      ),
      fig(["Estrutura do Observer", "Observer structure"], [
        [node("sj", ["Subject (Order)", "Subject (Order)"], "service")],
        [node("ob", ["«interface» Observer", "«interface» Observer"], "edge")],
        [node("o1", "EmailSender", "data"), node("o2", "StockUpdater", "data"), node("o3", "MetricsRecorder", "data"), node("o4", "CustomerScreen", "client")],
      ], [edge("sj", "ob", ["notifica *", "notifies *"]), edge("o1", "ob", "", { dashed: true }), edge("o2", "ob", "", { dashed: true }), edge("o3", "ob", "", { dashed: true }), edge("o4", "ob", "", { dashed: true })]),
      h(["Sequência de uma notificação", "Sequence of a notification"]),
      code(`sequenceDiagram
  participant C as Client
  participant S as Order (Subject)
  participant E as EmailSender
  participant K as StockUpdater
  E->>S: subscribe(self)
  K->>S: subscribe(self)
  C->>S: markPaid()
  S->>S: state = PAID
  S->>E: update(event)
  S->>K: update(event)
  Note over S: The subject does not know what each observer does`),
      h(["Implementação em TypeScript, com eventos tipados", "TypeScript implementation with typed events"]),
      code(`// A small, typed event emitter: the Subject
type Listener<E> = (event: E) => void;

class EventEmitter<Events extends Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<Listener<any>>>();

  on<K extends keyof Events>(name: K, fn: Listener<Events[K]>): () => void {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set());
    this.listeners.get(name)!.add(fn);
    return () => this.listeners.get(name)?.delete(fn);        // unsubscribe function
  }
  protected emit<K extends keyof Events>(name: K, event: Events[K]) {
    for (const fn of [...(this.listeners.get(name) ?? [])]) {  // copy: safe if observers unsubscribe while notified
      try { fn(event); } catch (e) { console.error("observer failed", e); }   // one failure must not stop others
    }
  }
}

interface OrderEvents { paid: { orderId: string; total: number }; cancelled: { orderId: string; reason: string } }

class Order extends EventEmitter<OrderEvents> {
  private status: "new" | "paid" | "cancelled" = "new";
  constructor(readonly id: string, private total: number) { super(); }
  markPaid() {
    if (this.status !== "new") throw new Error("invalid transition");
    this.status = "paid";
    this.emit("paid", { orderId: this.id, total: this.total });   // push: event carries the data
  }
}

const order = new Order("o-1", 99.9);
const off = order.on("paid", (e) => console.log("send email for", e.orderId));
order.on("paid", (e) => console.log("update stock for", e.orderId));
order.on("paid", (e) => console.log("record revenue", e.total));
order.markPaid();
off();        // the email observer is detached`),
      p(["Detalhes que importam: o `emit` percorre uma **cópia** da lista, pois um observador pode se desinscrever durante a notificação; cada chamada fica em `try/catch`, para que um observador com erro não impeça os outros; e `on` devolve uma função de cancelamento, o que evita *vazamentos* quando o ouvinte nunca é removido.", "Details that matter: `emit` walks a **copy** of the list, since an observer may unsubscribe during notification; each call sits in `try/catch` so a failing observer does not stop the others; and `on` returns a cancel function, which avoids *leaks* when the listener is never removed."]),
      h(["Modelo push x pull", "Push vs pull model"]),
      table([["Aspecto", "Aspect"], ["Push", "Push"], ["Pull", "Pull"]],
        [["O que o subject envia", "What the subject sends"], ["Os dados da mudança dentro da notificação", "The change data inside the notification"], ["Apenas um aviso; o observador consulta o subject", "Only a notice; the observer queries the subject"]],
        [["Acoplamento", "Coupling"], ["O subject decide o que enviar; observadores recebem coisas que talvez não usem", "The subject decides what to send; observers receive things they may not use"], ["O observador conhece a interface do subject", "The observer knows the subject's interface"]],
        [["Eficiência", "Efficiency"], ["Boa se os dados são pequenos", "Good if the data is small"], ["Boa se os dados são grandes e poucos observadores precisam deles", "Good if data is large and few observers need it"]],
        [["Uso típico", "Typical use"], ["Eventos de domínio, `addEventListener`", "Domain events, `addEventListener`"], ["Atualização de interface a partir do estado do modelo", "UI refresh from the model state"]],
      ),
      h(["Variações: síncrono, assíncrono e distribuído", "Variations: synchronous, asynchronous and distributed"]),
      p(["No Observer clássico, a notificação é **síncrona**: `notify` só termina quando todos os observadores terminam, o que pode atrasar o subject (um observador lento atrasa tudo) e propaga exceções. Para evitar isso, as notificações podem ser **assíncronas**, via fila interna ou *event loop*. Em escala de sistema, o mesmo conceito vira **mensageria publish/subscribe** (Kafka, RabbitMQ, SNS, Redis Pub/Sub): o publicador e os assinantes ficam em processos diferentes, desacoplados no tempo e no espaço, com entrega, ordem e duplicação a tratar (veja os artigos de mensageria). A diferença importante: no Observer em memória, a entrega é garantida enquanto o processo vive; em um broker, é preciso pensar em confirmações, reprocessamento e idempotência.", "In classic Observer, notification is **synchronous**: `notify` only finishes when all observers finish, which can slow the subject (one slow observer delays everything) and propagates exceptions. To avoid this, notifications can be **asynchronous**, via an internal queue or the *event loop*. At system scale, the same concept becomes **publish/subscribe messaging** (Kafka, RabbitMQ, SNS, Redis Pub/Sub): publisher and subscribers sit in different processes, decoupled in time and space, with delivery, ordering and duplication to handle (see the messaging articles). The important difference: in in-memory Observer, delivery is guaranteed while the process lives; in a broker, you must think about acknowledgements, reprocessing and idempotency."]),
      fig(["Observer em memória x publish/subscribe com broker", "In-memory Observer vs publish/subscribe with a broker"], [
        [node("pub", "Publisher", "service")],
        [node("bus", ["Event bus / Broker", "Event bus / Broker"], "queue")],
        [node("s1", ["Subscriber A", "Subscriber A"], "service"), node("s2", ["Subscriber B", "Subscriber B"], "service"), node("s3", ["Subscriber C", "Subscriber C"], "service")],
      ], [edge("pub", "bus", "publish"), edge("bus", "s1", "subscribe", { dashed: true }), edge("bus", "s2", "", { dashed: true }), edge("bus", "s3", "", { dashed: true })]),
      h(["Vantagens e desvantagens", "Advantages and disadvantages"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Disadvantages"]],
        [["Baixo acoplamento: o subject não conhece os observadores concretos", "Low coupling: the subject does not know concrete observers"], ["A ordem de notificação não é garantida nem deve ser assumida", "Notification order is not guaranteed and should not be assumed"]],
        [["Observadores novos entram sem alterar o subject (OCP)", "New observers join without changing the subject (OCP)"], ["Fluxo difícil de seguir: quem reage a quê só se vê em tempo de execução", "Hard-to-follow flow: who reacts to what is only visible at run time"]],
        [["Relacionamentos dinâmicos: inscrever e cancelar a qualquer hora", "Dynamic relationships: subscribe and cancel at any time"], ["Vazamentos de memória se os observadores não são removidos (*lapsed listener*)", "Memory leaks if observers are not removed (*lapsed listener*)"]],
        [["Broadcast natural para vários interessados", "Natural broadcast to several interested parties"], ["Cascatas de atualizações e ciclos podem surgir (A notifica B que notifica A)", "Cascades of updates and cycles may arise (A notifies B which notifies A)"]],
      ),
      h(["Armadilhas comuns", "Common pitfalls"]),
      ul(
        ["**Lapsed listener**: um observador de vida curta fica registrado em um subject de vida longa e nunca é coletado pelo coletor de lixo. Sempre ofereça e use o cancelamento (`unsubscribe`), ou referências fracas.", "**Lapsed listener**: a short-lived observer stays registered on a long-lived subject and is never garbage collected. Always offer and use cancellation (`unsubscribe`), or weak references."],
        ["**Modificação da lista durante a notificação**: itere sobre uma cópia.", "**Modifying the list during notification**: iterate over a copy."],
        ["**Exceções**: decida a política (isolar cada observador, registrar e seguir) em vez de deixar um erro interromper a cadeia.", "**Exceptions**: decide the policy (isolate each observer, log and continue) instead of letting an error interrupt the chain."],
        ["**Notificações em excesso**: mudar cinco campos e disparar cinco notificações. Agrupe (*batch*) ou use *debounce*.", "**Excess notifications**: changing five fields and firing five notifications. Batch them or use *debounce*."],
        ["**Estado inconsistente**: notificar no meio de uma atualização, quando o objeto está pela metade. Notifique só depois que o estado está completo e consistente.", "**Inconsistent state**: notifying in the middle of an update, when the object is half done. Notify only after the state is complete and consistent."],
        ["**Reentrância**: um observador altera o subject durante a notificação, disparando outra notificação. Defina regras claras.", "**Reentrancy**: an observer changes the subject during notification, triggering another notification. Define clear rules."],
      ),
      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      ul(
        ["**Use** quando a mudança em um objeto precisa disparar reações em outros que você não conhece de antemão, quando o conjunto de interessados varia em tempo de execução e em interfaces reativas (modelo e visão).", "**Use it** when a change in one object must trigger reactions in others you do not know in advance, when the set of interested parties varies at run time and in reactive interfaces (model and view)."],
        ["**Use** para eventos de domínio (`OrderPaid`) que desacoplam módulos dentro do mesmo processo.", "**Use it** for domain events (`OrderPaid`) that decouple modules inside the same process."],
        ["**Evite** quando o fluxo é sequencial e as etapas dependem umas das outras: uma chamada direta é mais legível.", "**Avoid it** when the flow is sequential and the steps depend on each other: a direct call is more readable."],
        ["**Evite** quando a ordem e a atomicidade importam muito (transferência bancária): eventos escondem acoplamentos temporais.", "**Avoid it** when order and atomicity matter a lot (a bank transfer): events hide temporal couplings."],
        ["**Evite** para só um interessado fixo: chame-o diretamente.", "**Avoid it** for a single fixed interested party: call it directly."],
      ),
      h(["Uso real em frameworks e bibliotecas", "Real use in frameworks and libraries"]),
      ul(
        ["**DOM**: `element.addEventListener('click', fn)` é Observer; o `MutationObserver` e o `IntersectionObserver` também.", "**DOM**: `element.addEventListener('click', fn)` is Observer; so are `MutationObserver` and `IntersectionObserver`."],
        ["**Node.js**: `EventEmitter` é o núcleo de streams, servidores HTTP e muitas bibliotecas.", "**Node.js**: `EventEmitter` is the core of streams, HTTP servers and many libraries."],
        ["**RxJS e programação reativa**: `Observable` e `subscribe` generalizam o padrão com operadores; o mesmo vale para o Reactor e o Project Reactor em Java.", "**RxJS and reactive programming**: `Observable` and `subscribe` generalize the pattern with operators; the same applies to Reactor and Project Reactor in Java."],
        ["**Vue, MobX, Svelte stores e Redux `subscribe`**: reatividade baseada em notificar quem lê um estado quando ele muda.", "**Vue, MobX, Svelte stores and Redux `subscribe`**: reactivity based on notifying whoever reads a state when it changes."],
        ["**Spring**: `ApplicationEventPublisher` e `@EventListener`; **Android**: `LiveData` e `Flow`; **Java**: `PropertyChangeListener`.", "**Spring**: `ApplicationEventPublisher` and `@EventListener`; **Android**: `LiveData` and `Flow`; **Java**: `PropertyChangeListener`."],
        ["**Sistemas distribuídos**: Kafka, SNS/SQS, Redis Pub/Sub e WebSockets de notificações são a versão em rede do mesmo padrão.", "**Distributed systems**: Kafka, SNS/SQS, Redis Pub/Sub and notification WebSockets are the network version of the same pattern."],
      ),
      h(["Observer x Mediator x Pub/Sub", "Observer vs Mediator vs Pub/Sub"]),
      table([["Padrão", "Pattern"], ["Ligação", "Link"], ["Observação", "Note"]],
        [["Observer", "Observer"], ["O observador conhece o subject (assina nele)", "The observer knows the subject (subscribes to it)"], ["Relação direta, normalmente no mesmo processo", "Direct relationship, usually in the same process"]],
        [["Pub/Sub", "Pub/Sub"], ["Publicador e assinante só conhecem o canal ou tópico", "Publisher and subscriber only know the channel or topic"], ["Mais desacoplado, frequentemente com broker", "More decoupled, often with a broker"]],
        [["Mediator", "Mediator"], ["Objetos conhecem o mediador, que coordena com regras centrais", "Objects know the mediator, which coordinates with central rules"], ["Muitos para muitos, com lógica de coordenação", "Many-to-many, with coordination logic"]],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Observer cria uma dependência um-para-muitos: ao mudar, o subject notifica os observadores inscritos.", "Observer creates a one-to-many dependency: on change, the subject notifies subscribed observers."],
        ["Ofereça cancelamento de inscrição, itere sobre cópia, isole falhas e notifique só com o estado consistente.", "Offer unsubscription, iterate over a copy, isolate failures and notify only with consistent state."],
        ["Push envia os dados no evento; pull manda só um aviso e o observador consulta.", "Push sends data in the event; pull sends only a notice and the observer queries."],
        ["Em escala de sistema, o padrão vira publish/subscribe com brokers, com garantias de entrega a tratar.", "At system scale, the pattern becomes publish/subscribe with brokers, with delivery guarantees to handle."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Observer é a mesma coisa que callback?** Um callback é a forma mais simples de um observador; o padrão inclui o registro de vários e o cancelamento.", "**Is Observer the same as a callback?** A callback is the simplest form of an observer; the pattern includes registering several and cancellation."],
        ["**A ordem de notificação é garantida?** Normalmente segue a ordem de inscrição, mas não dependa disso; trate observadores como independentes.", "**Is the notification order guaranteed?** It usually follows subscription order, but do not depend on it; treat observers as independent."],
        ["**Como evitar vazamentos?** Cancele a inscrição quando o observador sair de cena (por exemplo, no `unmount` de um componente) ou use referências fracas.", "**How to avoid leaks?** Cancel the subscription when the observer leaves the scene (for example, on a component's `unmount`) or use weak references."],
        ["**Observer e eventos de domínio são o mesmo?** Os eventos de domínio usam o mecanismo do Observer para expressar fatos de negócio já ocorridos, nomeados no passado (`OrderPaid`).", "**Are Observer and domain events the same?** Domain events use the Observer mechanism to express business facts that already happened, named in the past tense (`OrderPaid`)."],
      ),
      tip(["Nomeie eventos como fatos no passado (`OrderPaid`, `UserRegistered`), não como comandos (`PayOrder`). O publicador relata o que aconteceu e não decide o que os outros fazem.", "Name events as facts in the past tense (`OrderPaid`, `UserRegistered`), not as commands (`PayOrder`). The publisher reports what happened and does not decide what others do."]),
    ] },
  { id: "padrao-command-e-state", section: "lld", level: 2, icon: "terminal", minutes: 12,
    title: ["Padrões Command e State", "Command and State patterns"],
    summary: ["Transformar ações em objetos (desfazer, filas, histórico) e modelar o comportamento por estado, com código completo e comparação.", "Turning actions into objects (undo, queues, history) and modeling behavior by state, with complete code and comparison."],
    body: [
      p(["Command e State são dois padrões comportamentais que, juntos, aparecem em editores de texto, máquinas de venda, fluxos de pedidos e interfaces gráficas. O **Command** trata *uma solicitação como um objeto*, o que permite parametrizar, enfileirar, registrar e desfazer operações. O **State** trata *o estado como um objeto*, o que permite que o comportamento de uma entidade mude conforme seu estado, eliminando condicionais gigantes. Eles se complementam: comandos disparam transições, e as transições dependem do estado.", "Command and State are two behavioral patterns that together appear in text editors, vending machines, order flows and graphical interfaces. **Command** treats *a request as an object*, which allows parameterizing, queueing, logging and undoing operations. **State** treats *the state as an object*, which allows an entity's behavior to change according to its state, eliminating giant conditionals. They complement each other: commands trigger transitions, and transitions depend on the state."]),
      h(["Command: o problema", "Command: the problem"]),
      p(["Em um editor de texto, o mesmo botão *Negrito* pode estar na barra de ferramentas, em um menu e em um atalho de teclado. Se cada um deles chamar diretamente o código de formatação, a lógica se duplica e é impossível implementar *desfazer*, pois ninguém lembra o que foi feito. Também não dá para agendar uma ação para depois, repetir uma sequência (macro) ou enviar a ação pela rede. O que falta é uma representação da própria ação como algo que se possa guardar e manipular.", "In a text editor, the same *Bold* button may be in the toolbar, a menu and a keyboard shortcut. If each calls the formatting code directly, logic is duplicated and *undo* is impossible, since nobody remembers what was done. It is also not possible to schedule an action for later, repeat a sequence (macro) or send the action over the network. What is missing is a representation of the action itself as something that can be stored and manipulated."]),
      h(["Command: estrutura", "Command: structure"]),
      ul(
        ["**Command**: interface com `execute()` (e, quando há desfazer, `undo()`).", "**Command**: interface with `execute()` (and, when there is undo, `undo()`)."],
        ["**ConcreteCommand**: liga um receptor a uma ação e guarda os parâmetros (`InsertTextCommand`).", "**ConcreteCommand**: binds a receiver to an action and stores the parameters (`InsertTextCommand`)."],
        ["**Receiver**: o objeto que sabe fazer o trabalho de verdade (o documento).", "**Receiver**: the object that actually knows how to do the work (the document)."],
        ["**Invoker**: quem dispara o comando sem saber o que ele faz (botão, atalho, fila, agendador).", "**Invoker**: whoever triggers the command without knowing what it does (button, shortcut, queue, scheduler)."],
        ["**Client**: cria o comando concreto e o associa ao receptor.", "**Client**: creates the concrete command and associates it with the receiver."],
      ),
      fig(["Estrutura do Command", "Command structure"], [
        [node("cl", "Client", "client")],
        [node("iv", ["Invoker (botão, atalho, fila)", "Invoker (button, shortcut, queue)"], "service")],
        [node("cm", ["«interface» Command", "«interface» Command"], "edge")],
        [node("c1", "InsertText", "data"), node("c2", "DeleteRange", "data")],
        [node("rc", ["Receiver (Document)", "Receiver (Document)"], "service")],
      ], [edge("cl", "iv", ["configura", "configures"]), edge("iv", "cm", "execute()"), edge("c1", "cm", "", { dashed: true }), edge("c2", "cm", "", { dashed: true }), edge("c1", "rc"), edge("c2", "rc")]),
      h(["Command com desfazer e refazer", "Command with undo and redo"]),
      code(`interface Command { execute(): void; undo(): void }

class Document {
  text = "";
  insertAt(pos: number, s: string) { this.text = this.text.slice(0, pos) + s + this.text.slice(pos); }
  deleteRange(pos: number, len: number) { const removed = this.text.slice(pos, pos + len); this.text = this.text.slice(0, pos) + this.text.slice(pos + len); return removed; }
}

class InsertText implements Command {
  constructor(private doc: Document, private pos: number, private s: string) {}
  execute() { this.doc.insertAt(this.pos, this.s); }
  undo() { this.doc.deleteRange(this.pos, this.s.length); }
}
class DeleteRange implements Command {
  private removed = "";
  constructor(private doc: Document, private pos: number, private len: number) {}
  execute() { this.removed = this.doc.deleteRange(this.pos, this.len); }   // remember what to restore
  undo() { this.doc.insertAt(this.pos, this.removed); }
}

class History {                                  // the invoker with undo/redo stacks
  private done: Command[] = []; private undone: Command[] = [];
  run(c: Command) { c.execute(); this.done.push(c); this.undone = []; }     // new action clears redo
  undo() { const c = this.done.pop(); if (c) { c.undo(); this.undone.push(c); } }
  redo() { const c = this.undone.pop(); if (c) { c.execute(); this.done.push(c); } }
}

const doc = new Document(); const h = new History();
h.run(new InsertText(doc, 0, "Hello"));
h.run(new InsertText(doc, 5, " world"));
h.undo();                       // "Hello"
h.redo();                       // "Hello world"`),
      p(["Um comando tem dois tipos de informação para desfazer: guardar o **inverso** da operação (como acima) ou guardar um **instantâneo** (*Memento*) do estado anterior. Para operações pesadas, o inverso é mais econômico; para operações difíceis de inverter, o instantâneo é mais seguro. Além do desfazer, o padrão habilita outros recursos:", "A command has two ways to support undo: storing the **inverse** of the operation (as above) or storing a **snapshot** (*Memento*) of the previous state. For heavy operations the inverse is cheaper; for operations hard to invert, the snapshot is safer. Beyond undo, the pattern enables other features:"]),
      ul(
        ["**Filas e agendamento**: guardar comandos em uma fila e executá-los depois, em outra thread ou máquina (filas de tarefas, *jobs*).", "**Queues and scheduling**: store commands in a queue and execute them later, in another thread or machine (task queues, *jobs*)."],
        ["**Registro e reexecução**: gravar os comandos em um log permite recuperar o estado reaplicando-os, como em *event sourcing* e em logs de transação de bancos de dados.", "**Logging and replay**: recording commands in a log allows recovering state by reapplying them, as in *event sourcing* and database transaction logs."],
        ["**Macros**: um comando composto (Composite) executa uma lista de comandos.", "**Macros**: a composite command (Composite) executes a list of commands."],
        ["**Transações**: executar vários comandos e desfazer todos se um falhar.", "**Transactions**: executing several commands and undoing all if one fails."],
        ["**Controle remoto e RPC**: serializar o comando e enviá-lo a outro processo.", "**Remote control and RPC**: serializing the command and sending it to another process."],
      ),
      h(["Command: vantagens, desvantagens e quando evitar", "Command: advantages, disadvantages and when to avoid"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Disadvantages"]],
        [["Desacopla quem pede de quem executa", "Decouples who asks from who executes"], ["Uma classe por ação pode inflar o número de classes", "One class per action can inflate the number of classes"]],
        [["Permite desfazer, refazer, filas, logs e macros", "Enables undo, redo, queues, logs and macros"], ["Desfazer correto exige cuidado com efeitos externos (e-mail enviado não se desfaz)", "Correct undo needs care with external effects (a sent email cannot be undone)"]],
        [["Novos comandos entram sem alterar o invoker (OCP)", "New commands join without changing the invoker (OCP)"], ["Comandos que guardam instantâneos grandes consomem memória", "Commands storing large snapshots consume memory"]],
        [["Facilita testes: cada ação é um objeto isolado", "Eases testing: each action is an isolated object"], ["Para ações simples e sem desfazer, é indireção desnecessária", "For simple actions without undo, it is unnecessary indirection"]],
      ),
      p(["Evite o padrão quando a ação é uma simples chamada de função sem necessidade de histórico, fila ou desfazer. Em linguagens com funções de primeira classe, um comando sem desfazer é só uma função (*closure*). Use a classe completa quando houver `undo`, serialização ou metadados (nome da ação, autor, data).", "Avoid the pattern when the action is a simple function call with no need for history, queue or undo. In languages with first-class functions, a command without undo is just a function (*closure*). Use the full class when there is `undo`, serialization or metadata (action name, author, date)."]),
      h(["State: o problema", "State: the problem"]),
      p(["Considere um documento em um fluxo editorial com os estados *rascunho*, *em revisão* e *publicado*. A operação `publish()` significa algo diferente em cada um: em rascunho, envia para revisão; em revisão, publica se o usuário for editor; publicado, não faz nada. A abordagem ingênua é um campo `status` e, dentro de cada método, um `switch` sobre ele. Com mais estados e operações, os `switch` se multiplicam e se repetem em todos os métodos, cada novo estado exige editar todos eles e as regras de transição ficam espalhadas, o que gera combinações inválidas e bugs sutis.", "Consider a document in an editorial flow with states *draft*, *in review* and *published*. The `publish()` operation means something different in each: in draft, it sends to review; in review, it publishes if the user is an editor; when published, it does nothing. The naive approach is a `status` field and, inside each method, a `switch` over it. With more states and operations, the `switch`es multiply and repeat across all methods, each new state requires editing all of them and transition rules are scattered, producing invalid combinations and subtle bugs."]),
      p(["O padrão **State** resolve isso movendo o comportamento de cada estado para uma classe própria. O objeto principal (o **Context**) mantém uma referência para o estado atual e **delega** as operações a ele; cada estado conhece as operações permitidas e **troca o estado do contexto** quando uma transição ocorre. O objeto parece mudar de classe em tempo de execução.", "The **State** pattern solves this by moving each state's behavior into its own class. The main object (the **Context**) holds a reference to the current state and **delegates** operations to it; each state knows the permitted operations and **swaps the context's state** when a transition happens. The object appears to change class at run time."]),
      fig(["Máquina de estados de um documento", "A document's state machine"], [
        [node("dr", ["Rascunho", "Draft"], "client")],
        [node("rv", ["Em revisão", "In review"], "service")],
        [node("pb", ["Publicado", "Published"], "data")],
        [node("ar", ["Arquivado", "Archived"], "cache")],
      ], [edge("dr", "rv", "submit()"), edge("rv", "dr", ["reject()", "reject()"], { dashed: true }), edge("rv", "pb", "approve()"), edge("pb", "ar", "archive()")]),
      h(["State: implementação", "State: implementation"]),
      code(`interface DocState {
  submit(ctx: Doc): void;
  approve(ctx: Doc, by: { editor: boolean }): void;
  reject(ctx: Doc): void;
  readonly name: string;
}

class Doc {
  private state: DocState = new Draft();
  setState(s: DocState) { console.log(this.state.name + " -> " + s.name); this.state = s; }
  get status() { return this.state.name; }
  submit() { this.state.submit(this); }                       // delegate everything
  approve(by: { editor: boolean }) { this.state.approve(this, by); }
  reject() { this.state.reject(this); }
}

class Draft implements DocState {
  name = "draft";
  submit(ctx: Doc) { ctx.setState(new InReview()); }
  approve() { throw new Error("cannot approve a draft"); }
  reject() { throw new Error("nothing to reject"); }
}
class InReview implements DocState {
  name = "in review";
  submit() { throw new Error("already submitted"); }
  approve(ctx: Doc, by: { editor: boolean }) {
    if (!by.editor) throw new Error("only editors can approve");
    ctx.setState(new Published());
  }
  reject(ctx: Doc) { ctx.setState(new Draft()); }
}
class Published implements DocState {
  name = "published";
  submit() { throw new Error("already published"); }
  approve() { /* idempotent: nothing to do */ }
  reject() { throw new Error("cannot reject a published document"); }
}

const d = new Doc();
d.submit();                         // draft -> in review
d.approve({ editor: true });        // in review -> published`),
      p(["Para estados **sem dados próprios**, as instâncias podem ser compartilhadas (cada estado como um *singleton* ou constante), em vez de criar objetos a cada transição. Quem define as transições? Na versão acima, os próprios estados (descentralizado, fácil de estender, mas as regras ficam espalhadas por várias classes). Outra opção é uma **tabela de transições** no contexto, mais fácil de visualizar e validar, que combina bem com TypeScript e uniões discriminadas.", "For states **without their own data**, instances can be shared (each state as a *singleton* or constant) instead of creating objects at every transition. Who defines the transitions? In the version above, the states themselves (decentralized, easy to extend, but rules are spread across several classes). Another option is a **transition table** in the context, easier to visualize and validate, which pairs well with TypeScript and discriminated unions."]),
      code(`// Table-driven alternative: compact and verifiable
type S = "draft" | "review" | "published" | "archived";
type E = "submit" | "approve" | "reject" | "archive";
const transitions: Record<S, Partial<Record<E, S>>> = {
  draft: { submit: "review" },
  review: { approve: "published", reject: "draft" },
  published: { archive: "archived" },
  archived: {},
};
function next(s: S, e: E): S {
  const to = transitions[s][e];
  if (!to) throw new Error("invalid event " + e + " in state " + s);
  return to;
}`),
      h(["Command x State x Strategy", "Command vs State vs Strategy"]),
      table([["Padrão", "Pattern"], ["Ideia central", "Core idea"], ["Quando muda o objeto delegado", "When the delegated object changes"]],
        [["Command", "Command"], ["Uma ação encapsulada com seus parâmetros, pronta para executar, desfazer ou guardar", "An encapsulated action with its parameters, ready to execute, undo or store"], ["Cada solicitação é um comando novo", "Each request is a new command"]],
        [["State", "State"], ["O comportamento depende do estado atual, e os estados controlam as transições", "Behavior depends on the current state, and states control transitions"], ["Automaticamente, quando uma transição ocorre", "Automatically, when a transition happens"]],
        [["Strategy", "Strategy"], ["Algoritmos alternativos intercambiáveis", "Interchangeable alternative algorithms"], ["Quando o cliente ou a configuração decide", "When the client or configuration decides"]],
      ),
      h(["State: vantagens, desvantagens e quando evitar", "State: advantages, disadvantages and when to avoid"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Disadvantages"]],
        [["Elimina `switch` repetidos sobre o estado e organiza o comportamento por estado (SRP)", "Removes repeated `switch`es on the state and organizes behavior per state (SRP)"], ["Mais classes, mesmo para máquinas de estados pequenas", "More classes, even for small state machines"]],
        [["Novos estados entram sem alterar os existentes (OCP)", "New states join without changing existing ones (OCP)"], ["As transições podem ficar espalhadas e difíceis de ver em conjunto", "Transitions may be scattered and hard to see as a whole"]],
        [["Torna as transições explícitas e as combinações inválidas, impossíveis", "Makes transitions explicit and invalid combinations impossible"], ["Estados que compartilham muita lógica podem duplicá-la", "States sharing lots of logic may duplicate it"]],
      ),
      ul(
        ["**Evite** com dois ou três estados estáveis e poucas operações: um `switch` ou uma tabela é mais simples.", "**Avoid it** with two or three stable states and few operations: a `switch` or a table is simpler."],
        ["**Evite** quando o estado é só um dado que não altera o comportamento (um campo de texto), sem regras de transição.", "**Avoid it** when the state is just data that does not change behavior (a text field), with no transition rules."],
        ["**Considere** uma biblioteca de máquinas de estados (XState em JavaScript, Spring State Machine, Stateless em .NET) quando houver estados aninhados, paralelos, tempos limite e a necessidade de visualizar o diagrama.", "**Consider** a state machine library (XState in JavaScript, Spring State Machine, Stateless in .NET) when there are nested states, parallel states, timeouts and a need to visualize the diagram."],
      ),
      h(["Uso real em frameworks e sistemas", "Real use in frameworks and systems"]),
      ul(
        ["**Command**: ações de menu e botões em frameworks de interface (`Action` do Swing, `ICommand` do WPF), `Runnable` e `Callable` do Java enviados a executores, filas de jobs como Sidekiq e Celery, e o *undo/redo* de qualquer editor.", "**Command**: menu and button actions in UI frameworks (Swing's `Action`, WPF's `ICommand`), Java's `Runnable` and `Callable` sent to executors, job queues such as Sidekiq and Celery, and the *undo/redo* of any editor."],
        ["**Command em arquitetura**: CQRS chama de *comandos* as operações que alteram o estado, separadas das consultas; o *event sourcing* grava eventos derivados deles.", "**Command in architecture**: CQRS calls *commands* the operations that change state, separate from queries; *event sourcing* records events derived from them."],
        ["**Git**: cada commit é um registro reaplicável de mudanças; `git revert` é um comando inverso.", "**Git**: each commit is a reapplicable record of changes; `git revert` is an inverse command."],
        ["**State**: ciclo de vida de pedidos e pagamentos, conexões TCP (LISTEN, ESTABLISHED, CLOSED), reprodutores de mídia (tocando, pausado, parado), semáforos e catracas, e o *state machine* de funções como o AWS Step Functions.", "**State**: order and payment lifecycles, TCP connections (LISTEN, ESTABLISHED, CLOSED), media players (playing, paused, stopped), traffic lights and turnstiles, and state machine services such as AWS Step Functions."],
        ["**React**: o `useReducer` com uma tabela de ações segue a mesma lógica de transições explícitas.", "**React**: `useReducer` with an action table follows the same logic of explicit transitions."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Command que mantém uma referência a objetos mutáveis que mudam entre a execução e o desfazer, tornando o `undo` incorreto.", "A command that keeps a reference to mutable objects that change between execution and undo, making `undo` incorrect."],
        ["Esquecer de limpar a pilha de refazer (*redo*) quando uma nova ação é executada.", "Forgetting to clear the redo stack when a new action is executed."],
        ["State em que qualquer estado pode alterar o contexto livremente, sem validar as transições permitidas.", "State where any state can change the context freely, without validating the permitted transitions."],
        ["Estados que guardam referência ao contexto e criam ciclos difíceis de serializar ou testar.", "States holding a reference to the context and creating cycles that are hard to serialize or test."],
        ["Persistir apenas o nome do estado sem a lógica de reconstrução, impossibilitando carregar o objeto do banco.", "Persisting only the state name without the reconstruction logic, making it impossible to load the object from the database."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Command transforma uma solicitação em objeto: dá desfazer, filas, histórico, macros e reexecução.", "Command turns a request into an object: it gives undo, queues, history, macros and replay."],
        ["O desfazer pode guardar o inverso da operação ou um instantâneo do estado anterior.", "Undo can store the inverse of the operation or a snapshot of the previous state."],
        ["State muda o comportamento do contexto delegando a um objeto de estado, que controla as transições.", "State changes the context's behavior by delegating to a state object, which controls transitions."],
        ["Para máquinas pequenas, use tabela de transições; para complexas, uma biblioteca de estados.", "For small machines use a transition table; for complex ones, a state library."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Command é igual a um callback?** Um callback é um comando mínimo; o padrão completo acrescenta metadados, `undo`, serialização e composição.", "**Is Command the same as a callback?** A callback is a minimal command; the full pattern adds metadata, `undo`, serialization and composition."],
        ["**Como desfazer algo que tem efeito externo?** Com ações de compensação (estornar um pagamento), como nas sagas, pois nem tudo é reversível.", "**How do you undo something with an external effect?** With compensating actions (refunding a payment), as in sagas, since not everything is reversible."],
        ["**State e máquina de estados finita são o mesmo?** O padrão é uma forma orientada a objetos de implementar uma máquina de estados finita.", "**Are State and a finite state machine the same?** The pattern is an object-oriented way to implement a finite state machine."],
        ["**Posso combinar Command e State?** Sim: comandos são os eventos que disparam as transições e, dependendo do estado, são aceitos ou rejeitados.", "**Can I combine Command and State?** Yes: commands are the events that trigger transitions and, depending on the state, are accepted or rejected."],
      ),
      tip(["Desenhe a máquina de estados antes de codificar. Se ela couber em um quadro com menos de cinco estados e sem comportamento rico, uma tabela de transições basta; senão, State com uma classe por estado.", "Draw the state machine before coding. If it fits on a whiteboard with fewer than five states and no rich behavior, a transition table is enough; otherwise, State with a class per state."]),
    ] },
  { id: "padrao-chain-of-responsibility", section: "lld", level: 1, icon: "link", minutes: 10,
    title: ["Padrão Chain of Responsibility", "Chain of Responsibility pattern"],
    summary: ["Passar um pedido por uma cadeia de handlers até alguém tratá-lo: código completo, middlewares, variações e uso real.", "Passing a request through a chain of handlers until someone handles it: complete code, middlewares, variations and real use."],
    body: [
      p(["Quando uma requisição chega a um servidor web, várias verificações precisam acontecer antes de o código de negócio rodar: registrar o acesso, validar o formato, autenticar o usuário, checar permissões, limitar a taxa de chamadas, decodificar o corpo. Se tudo isso estiver em um único método gigante, ele fica ilegível, impossível de reordenar e de reutilizar em outras rotas. O padrão **Chain of Responsibility** (comportamental, GoF) resolve o problema organizando os tratadores em uma **cadeia**: o pedido entra no primeiro elo, que decide **tratá-lo, rejeitá-lo ou passá-lo ao próximo**. Quem envia o pedido não sabe qual elo vai respondê-lo, e cada elo conhece apenas o seguinte.", "When a request arrives at a web server, several checks must happen before business code runs: log the access, validate the format, authenticate the user, check permissions, rate-limit calls, decode the body. If everything sits in one giant method, it becomes unreadable, impossible to reorder and impossible to reuse on other routes. The **Chain of Responsibility** pattern (behavioral, GoF) solves the problem by organizing handlers in a **chain**: the request enters the first link, which decides to **handle it, reject it or pass it to the next**. The sender does not know which link will answer it, and each link only knows the next one."]),
      h(["Estrutura e participantes", "Structure and participants"]),
      ul(
        ["**Handler**: interface (ou classe base) com `handle(request)` e a referência ao próximo handler.", "**Handler**: interface (or base class) with `handle(request)` and the reference to the next handler."],
        ["**ConcreteHandler**: faz a sua parte e decide: responder e parar, ou delegar ao próximo.", "**ConcreteHandler**: does its part and decides: respond and stop, or delegate to the next."],
        ["**Client**: monta a cadeia e envia o pedido ao primeiro elo.", "**Client**: assembles the chain and sends the request to the first link."],
      ),
      fig(["Uma cadeia de handlers de requisição HTTP", "A chain of HTTP request handlers"], [
        [node("rq", ["Requisição", "Request"], "client")],
        [node("h1", "Logging", "edge")],
        [node("h2", "Auth", "edge")],
        [node("h3", "RateLimit", "edge")],
        [node("h4", ["Controller", "Controller"], "service")],
      ], [edge("rq", "h1"), edge("h1", "h2", "next()"), edge("h2", "h3", "next()"), edge("h3", "h4", "next()"), edge("h2", "rq", ["401 e para", "401 and stops"], { dashed: true })]),
      h(["Implementação clássica: aprovação por alçadas", "Classic implementation: approval by authority levels"]),
      p(["Um exemplo tradicional: despesas pedem aprovação de acordo com o valor. Um gerente aprova até 1.000, um diretor até 10.000 e o conselho acima disso. Cada elo tenta tratar e, se não puder, passa adiante. Perceba que o solicitante só entrega o pedido ao primeiro elo.", "A traditional example: expenses need approval according to the amount. A manager approves up to 1,000, a director up to 10,000 and the board above that. Each link tries to handle it and, if it cannot, passes it on. Notice that the requester only hands the request to the first link."]),
      code(`interface Expense { amount: number; reason: string }

abstract class Approver {
  private next?: Approver;
  setNext(n: Approver): Approver { this.next = n; return n; }      // allows chaining: a.setNext(b).setNext(c)
  approve(e: Expense): string {
    if (this.canApprove(e)) return this.name + " approved " + e.amount;
    if (this.next) return this.next.approve(e);                    // pass along
    return "nobody can approve " + e.amount;                       // end of chain: decide the default!
  }
  protected abstract readonly name: string;
  protected abstract canApprove(e: Expense): boolean;
}
class Manager extends Approver { protected name = "manager"; protected canApprove(e: Expense) { return e.amount <= 1_000; } }
class Director extends Approver { protected name = "director"; protected canApprove(e: Expense) { return e.amount <= 10_000; } }
class Board extends Approver { protected name = "board"; protected canApprove(e: Expense) { return e.amount <= 1_000_000; } }

const manager = new Manager();
manager.setNext(new Director()).setNext(new Board());

console.log(manager.approve({ amount: 500, reason: "books" }));        // manager approved 500
console.log(manager.approve({ amount: 7500, reason: "servers" }));     // director approved 7500
console.log(manager.approve({ amount: 2_000_000, reason: "office" })); // nobody can approve`),
      h(["Chain como middleware (a forma mais comum hoje)", "Chain as middleware (the most common form today)"]),
      p(["Em servidores web, a cadeia costuma ser escrita como uma lista de funções `(request, next) => ...`. Cada função pode **fazer algo antes**, chamar `next()` para continuar, **fazer algo depois** que a resposta volta e, se quiser, **interromper** devolvendo a resposta sem chamar `next()`. Esse estilo é o de Express, Koa e ASP.NET Core, e é uma mistura de Chain of Responsibility com Decorator.", "In web servers the chain is usually written as a list of `(request, next) => ...` functions. Each function can **do something before**, call `next()` to continue, **do something after** the response comes back and, if it wants, **stop** by returning the response without calling `next()`. This style is that of Express, Koa and ASP.NET Core, and is a mix of Chain of Responsibility and Decorator."]),
      code(`interface Req { path: string; headers: Record<string, string>; user?: { id: string; admin: boolean } }
interface Res { status: number; body: string }
type Next = () => Promise<Res>;
type Middleware = (req: Req, next: Next) => Promise<Res>;

const logging: Middleware = async (req, next) => {
  const t0 = Date.now();
  const res = await next();                                  // go down the chain, come back up
  console.log(req.path, res.status, Date.now() - t0 + "ms");
  return res;
};
const auth: Middleware = async (req, next) => {
  const token = req.headers["authorization"];
  if (!token) return { status: 401, body: "unauthorized" };  // short-circuit: next() is NOT called
  req.user = { id: "u1", admin: token === "admin" };
  return next();
};
const adminOnly: Middleware = async (req, next) =>
  req.user?.admin ? next() : { status: 403, body: "forbidden" };

// the engine that composes the chain
function compose(middlewares: Middleware[], handler: (req: Req) => Promise<Res>) {
  return (req: Req): Promise<Res> => {
    const dispatch = (i: number): Promise<Res> =>
      i === middlewares.length ? handler(req) : middlewares[i](req, () => dispatch(i + 1));
    return dispatch(0);
  };
}
const app = compose([logging, auth, adminOnly], async () => ({ status: 200, body: "secret data" }));
await app({ path: "/admin", headers: { authorization: "admin" } });   // 200`),
      h(["Variações", "Variations"]),
      table([["Variação", "Variation"], ["Comportamento", "Behavior"], ["Exemplo", "Example"]],
        [["Tratamento exclusivo", "Exclusive handling"], ["O primeiro elo capaz trata e a cadeia para", "The first capable link handles it and the chain stops"], ["Aprovação por alçadas, tratadores de exceção (`catch` em sequência)", "Approval by levels, exception handlers (sequential `catch`)"]],
        [["Tratamento por todos", "Handling by all"], ["Todos os elos processam o pedido e passam adiante", "All links process the request and pass it on"], ["Pipeline de middlewares, filtros de logging, validação em etapas", "Middleware pipeline, logging filters, staged validation"]],
        [["Com retorno de volta", "With return trip"], ["A resposta atravessa a cadeia no sentido inverso", "The response goes back through the chain in reverse"], ["Express/Koa `await next()`, interceptadores HTTP", "Express/Koa `await next()`, HTTP interceptors"]],
        [["Cadeia como lista", "Chain as a list"], ["Em vez de elos encadeados, uma lista ordenada de handlers percorrida em laço", "Instead of linked links, an ordered list of handlers walked in a loop"], ["Pipelines configuráveis; mais fácil de reordenar e testar", "Configurable pipelines; easier to reorder and test"]],
        [["Cadeia com falha ou fallback", "Chain with failure or fallback"], ["Tenta cada elo até um funcionar", "Tries each link until one works"], ["Provedores de pagamento reserva, vários espelhos de download", "Backup payment providers, multiple download mirrors"]],
      ),
      h(["Vantagens e desvantagens", "Advantages and disadvantages"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Disadvantages"]],
        [["Desacopla o remetente dos receptores", "Decouples the sender from the receivers"], ["Sem garantia de que o pedido será tratado: pode chegar ao fim da cadeia sem resposta", "No guarantee the request will be handled: it can reach the end of the chain with no answer"]],
        [["Cada handler tem uma única responsabilidade e é reutilizável (SRP)", "Each handler has a single responsibility and is reusable (SRP)"], ["Depuração difícil: é preciso seguir o fluxo por vários elos", "Hard to debug: you must follow the flow through several links"]],
        [["Ordem e composição configuráveis em tempo de execução", "Order and composition configurable at run time"], ["A ordem importa e erros de ordem são sutis (autenticar depois de autorizar)", "Order matters and ordering errors are subtle (authenticating after authorizing)"]],
        [["Novos handlers entram sem alterar os existentes (OCP)", "New handlers join without changing existing ones (OCP)"], ["Cadeias longas podem prejudicar o desempenho", "Long chains can hurt performance"]],
      ),
      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      ul(
        ["**Use** quando mais de um objeto pode tratar um pedido e o tratador não é conhecido de antemão; quando o conjunto de tratadores deve ser definido dinamicamente; e quando há um pipeline de preocupações transversais (log, autenticação, validação, cache).", "**Use it** when more than one object can handle a request and the handler is not known in advance; when the set of handlers must be defined dynamically; and when there is a pipeline of cross-cutting concerns (log, authentication, validation, cache)."],
        ["**Evite** quando o tratador é sempre o mesmo e conhecido: chame-o diretamente.", "**Avoid it** when the handler is always the same and known: call it directly."],
        ["**Evite** quando a ordem é rígida e o fluxo é sequencial por natureza: uma função com etapas nomeadas é mais clara.", "**Avoid it** when order is rigid and the flow is sequential by nature: a function with named steps is clearer."],
        ["**Evite** quando é essencial garantir que *alguém* trate: sem cuidado, o pedido pode se perder. Defina sempre o que acontece ao final da cadeia (resposta padrão ou erro).", "**Avoid it** when it is essential to ensure *someone* handles it: without care the request may get lost. Always define what happens at the end of the chain (default response or error)."],
      ),
      h(["Uso real em frameworks e sistemas", "Real use in frameworks and systems"]),
      ul(
        ["**Express, Koa, Fastify e ASP.NET Core**: o pipeline de middlewares é exatamente esse padrão.", "**Express, Koa, Fastify and ASP.NET Core**: the middleware pipeline is exactly this pattern."],
        ["**Java Servlet Filters** e **Spring Security**, que encadeia dezenas de filtros (autenticação, CSRF, autorização) em uma `FilterChain`.", "**Java Servlet Filters** and **Spring Security**, which chains dozens of filters (authentication, CSRF, authorization) in a `FilterChain`."],
        ["**Tratamento de exceções**: blocos `catch` sucessivos ou `@ExceptionHandler` tentam, em ordem, tratar o erro.", "**Exception handling**: successive `catch` blocks or `@ExceptionHandler` try, in order, to handle the error."],
        ["**Eventos de interface**: o DOM propaga um evento do elemento mais interno para os pais (*bubbling*), e cada ancestral pode tratá-lo ou interrompê-lo com `stopPropagation()`.", "**UI events**: the DOM propagates an event from the innermost element to its parents (*bubbling*), and each ancestor can handle it or stop it with `stopPropagation()`."],
        ["**Logging**: bibliotecas como Log4j e Logback encaminham mensagens por appenders e filtros em sequência.", "**Logging**: libraries such as Log4j and Logback route messages through appenders and filters in sequence."],
        ["**Suporte em camadas**: central de atendimento em níveis (nível 1, nível 2, especialista) é a mesma lógica no mundo real.", "**Tiered support**: a help desk in levels (level 1, level 2, specialist) is the same logic in the real world."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Esquecer de chamar `next()` em um middleware, deixando a requisição pendurada sem resposta.", "Forgetting to call `next()` in a middleware, leaving the request hanging with no response."],
        ["Chamar `next()` e também devolver uma resposta, produzindo duas respostas (erro típico em Express: *headers already sent*).", "Calling `next()` and also returning a response, producing two responses (a typical Express error: *headers already sent*)."],
        ["Colocar lógica de negócio no meio da cadeia, em vez de manter nela apenas preocupações transversais.", "Putting business logic in the middle of the chain, instead of keeping only cross-cutting concerns in it."],
        ["Ordenar mal: um limitador de taxa depois de uma operação cara não protege nada.", "Ordering badly: a rate limiter after an expensive operation protects nothing."],
        ["Handlers com estado compartilhado mutável, sujeitos a corridas em requisições concorrentes.", "Handlers with shared mutable state, subject to races in concurrent requests."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Chain of Responsibility passa um pedido por uma sequência de handlers; cada um trata, rejeita ou repassa.", "Chain of Responsibility passes a request through a sequence of handlers; each handles, rejects or forwards it."],
        ["Pode ser exclusiva (o primeiro que trata para) ou em pipeline (todos processam), e a versão middleware inclui o caminho de volta.", "It can be exclusive (the first that handles it stops) or a pipeline (all process), and the middleware version includes the return path."],
        ["Define sempre o comportamento ao fim da cadeia e documenta a ordem dos handlers.", "Always define behavior at the end of the chain and document the order of handlers."],
        ["Difere do Decorator porque na cadeia um elo pode interromper e responder.", "It differs from Decorator because in a chain a link can stop and respond."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Middleware e Chain of Responsibility são a mesma coisa?** O middleware é uma implementação moderna do padrão, com a vantagem do `next()` que permite agir antes e depois.", "**Are middleware and Chain of Responsibility the same thing?** Middleware is a modern implementation of the pattern, with the advantage of `next()` allowing action before and after."],
        ["**Como testar uma cadeia?** Teste cada handler isoladamente com um `next` falso e teste a composição para validar a ordem.", "**How do you test a chain?** Test each handler in isolation with a fake `next` and test the composition to validate the order."],
        ["**A cadeia pode ser ramificada?** O padrão clássico é linear; ramificações viram árvores de decisão ou roteadores, que são outro desenho.", "**Can the chain branch?** The classic pattern is linear; branches become decision trees or routers, which is a different design."],
        ["**Qual a diferença para Observer?** No Observer, todos os assinantes recebem o evento; na cadeia, o pedido anda de elo em elo e pode parar em algum deles.", "**What is the difference from Observer?** In Observer, all subscribers receive the event; in a chain, the request moves link by link and may stop at one."],
      ),
      tip(["Em um pipeline de requisições, ordene do mais barato e geral para o mais caro e específico: log e limite de taxa primeiro, autenticação depois, autorização e validação de negócio por último. Rejeitar cedo economiza recursos.", "In a request pipeline, order from cheapest and most general to most expensive and specific: log and rate limit first, authentication next, authorization and business validation last. Rejecting early saves resources."]),
    ] },
  { id: "exemplo-de-lld-estacionamento", section: "lld", level: 1, icon: "local_parking", minutes: 16,
    title: ["Exemplo de LLD: sistema de estacionamento", "LLD example: parking lot system"],
    summary: ["Do enunciado ao código: requisitos, entidades, diagrama de classes, Strategy para preço, concorrência de vagas e extensões.", "From statement to code: requirements, entities, class diagram, Strategy for pricing, spot concurrency and extensions."],
    body: [
      p(["O estacionamento é um dos exercícios de LLD mais clássicos, porque cabe em uma conversa de 45 minutos e, ao mesmo tempo, exercita tudo o que importa: encontrar entidades, distribuir responsabilidades, usar herança com critério, aplicar padrões onde há variação real (preço, escolha de vaga) e pensar em concorrência. Este artigo percorre o roteiro completo, do enunciado ao código TypeScript, seguindo os passos do primeiro artigo da seção: requisitos, entidades, relacionamentos, interfaces, fluxos, código e extensões.", "The parking lot is one of the most classic LLD exercises, because it fits in a 45-minute conversation and at the same time exercises everything that matters: finding entities, distributing responsibilities, using inheritance with judgment, applying patterns where there is real variation (pricing, spot selection) and thinking about concurrency. This article walks the complete roadmap, from statement to TypeScript code, following the steps of the section's first article: requirements, entities, relationships, interfaces, flows, code and extensions."]),
      h(["1. Esclarecendo os requisitos", "1. Clarifying the requirements"]),
      p(["O enunciado costuma ser vago: *projete um sistema de estacionamento*. O primeiro passo é perguntar. Em uma entrevista, essas perguntas mostram maturidade; no trabalho, evitam retrabalho. Vamos fixar o seguinte escopo:", "The statement is usually vague: *design a parking lot system*. The first step is to ask. In an interview, these questions show maturity; at work, they avoid rework. Let us fix the following scope:"]),
      table([["Requisito", "Requirement"], ["Decisão", "Decision"]],
        [["Estrutura física", "Physical structure"], ["Vários andares, cada um com vagas de tamanhos diferentes", "Several floors, each with spots of different sizes"]],
        [["Tipos de veículo", "Vehicle types"], ["Moto, carro e caminhonete (van)", "Motorcycle, car and van"]],
        [["Tipos de vaga", "Spot types"], ["Pequena (moto), média (carro) e grande (van). Um veículo menor pode ocupar uma vaga maior", "Small (motorcycle), medium (car) and large (van). A smaller vehicle may take a larger spot"]],
        [["Entrada", "Entry"], ["O sistema emite um ticket com a vaga atribuída e a hora de entrada", "The system issues a ticket with the assigned spot and the entry time"]],
        [["Saída", "Exit"], ["O motorista apresenta o ticket, o sistema calcula o valor, registra o pagamento e libera a vaga", "The driver presents the ticket, the system computes the fee, records the payment and frees the spot"]],
        [["Preço", "Pricing"], ["Por hora, com valores por tipo de veículo; precisa ser extensível (diária, planos, promoções)", "Hourly, with values per vehicle type; must be extensible (daily, plans, promotions)"]],
        [["Estacionamento cheio", "Lot full"], ["Recusar a entrada com uma mensagem clara", "Refuse entry with a clear message"]],
        [["Concorrência", "Concurrency"], ["Várias cancelas (entradas) funcionando ao mesmo tempo: nunca atribuir a mesma vaga a dois carros", "Several gates (entries) working at the same time: never assign the same spot to two cars"]],
        [["Fora do escopo", "Out of scope"], ["Reservas, vagas para deficientes, carregadores elétricos, multas, reconhecimento de placa (tratados em extensões)", "Reservations, disabled spots, EV chargers, fines, plate recognition (handled in extensions)"]],
      ),
      h(["2. Encontrando as entidades", "2. Finding the entities"]),
      p(["Sublinhando os substantivos do enunciado aparecem: estacionamento, andar, vaga, veículo, ticket, pagamento, cancela. Os verbos sugerem as operações: *estacionar*, *sair*, *calcular preço*, *pagar*, *liberar vaga*. Não é preciso uma classe para tudo: a cancela, por exemplo, é um ator que chama o sistema, e não precisa ser modelada agora. Já o preço tem variação real, então merece abstração.", "Underlining the nouns in the statement we get: parking lot, floor, spot, vehicle, ticket, payment, gate. The verbs suggest operations: *park*, *exit*, *compute fee*, *pay*, *free spot*. A class for everything is not needed: the gate, for example, is an actor calling the system and does not need modeling now. Pricing, on the other hand, has real variation and deserves an abstraction."]),
      table([["Entidade", "Entity"], ["Responsabilidade", "Responsibility"], ["Por que existe", "Why it exists"]],
        [["`Vehicle` (e subtipos)", "`Vehicle` (and subtypes)"], ["Conhece a placa e o tipo", "Knows its plate and type"], ["O tipo decide qual vaga serve", "The type decides which spot fits"]],
        [["`ParkingSpot`", "`ParkingSpot`"], ["Conhece seu tamanho, andar e se está livre; sabe se aceita um veículo", "Knows its size, floor and whether it is free; knows whether it accepts a vehicle"], ["Guarda o estado de ocupação", "Holds the occupancy state"]],
        [["`Floor`", "`Floor`"], ["Agrupa vagas e encontra a primeira livre para um veículo", "Groups spots and finds the first free one for a vehicle"], ["Organiza a busca", "Organizes the search"]],
        [["`Ticket`", "`Ticket`"], ["Registra veículo, vaga e hora de entrada (imutável)", "Records vehicle, spot and entry time (immutable)"], ["Comprova a permanência", "Proves the stay"]],
        [["`PricingStrategy`", "`PricingStrategy`"], ["Calcula o valor a partir da duração e do veículo", "Computes the fee from duration and vehicle"], ["Ponto de extensão (Strategy)", "Extension point (Strategy)"]],
        [["`ParkingLot`", "`ParkingLot`"], ["Orquestra entrada e saída; é a porta de entrada do sistema (Facade)", "Orchestrates entry and exit; it is the system's entry point (Facade)"], ["Coordena o fluxo", "Coordinates the flow"]],
        [["`Clock`", "`Clock`"], ["Fornece a hora atual", "Provides the current time"], ["Permite testar sem esperar horas", "Allows testing without waiting hours"]],
      ),
      h(["3. Diagrama de classes", "3. Class diagram"]),
      fig(["Diagrama de classes do estacionamento", "Parking lot class diagram"], [
        [node("lot", "ParkingLot", "service")],
        [node("floor", "Floor", "service"), node("ticket", "Ticket", "queue")],
        [node("spot", "ParkingSpot", "data"), node("veh", ["Vehicle", "Vehicle"], "client")],
        [node("ps", ["«interface» PricingStrategy", "«interface» PricingStrategy"], "edge"), node("clock", ["«interface» Clock", "«interface» Clock"], "edge")],
        [node("hourly", "HourlyPricing", "ext"), node("daily", "DailyCapPricing", "ext")],
      ], [edge("lot", "floor", "1..*"), edge("floor", "spot", "1..*"), edge("lot", "ticket", ["emite", "issues"]), edge("ticket", "spot"), edge("ticket", "veh"), edge("lot", "ps", ["usa", "uses"]), edge("lot", "clock", ["usa", "uses"]), edge("hourly", "ps", "", { dashed: true }), edge("daily", "ps", "", { dashed: true })]),
      code(`classDiagram
  class ParkingLot {
    -floors Floor[]
    -active Map~string, Ticket~
    +enter(v Vehicle) Ticket
    +exit(ticketId string) Receipt
  }
  class Floor {
    +number int
    +allocate(v Vehicle) ParkingSpot
  }
  class ParkingSpot {
    +id string
    +size SpotSize
    +isFree() bool
    +fits(v Vehicle) bool
    +tryTake(v Vehicle) bool
    +release()
  }
  class Vehicle {
    +plate string
    +type VehicleType
  }
  class Ticket {
    +id string
    +vehicle Vehicle
    +spot ParkingSpot
    +enteredAt Date
  }
  class PricingStrategy {
    <<interface>>
    +fee(t Ticket, exitAt Date) number
  }
  ParkingLot "1" *-- "1..*" Floor
  Floor "1" *-- "1..*" ParkingSpot
  ParkingLot ..> Ticket
  Ticket --> Vehicle
  Ticket --> ParkingSpot
  ParkingLot --> PricingStrategy
  HourlyPricing ..|> PricingStrategy`),
      p(["Decisões de design registradas no diagrama: `ParkingLot` *compõe* andares e estes *compõem* vagas (se o estacionamento deixa de existir, os andares também); `Ticket` apenas *associa* veículo e vaga; `PricingStrategy` e `Clock` são interfaces injetadas, o que aplica o princípio da inversão de dependência. A herança entre os tipos de veículo é discutida a seguir, pois é o ponto em que o design pode ficar inchado sem necessidade.", "Design decisions recorded in the diagram: `ParkingLot` *composes* floors and these *compose* spots (if the lot ceases to exist, so do the floors); `Ticket` merely *associates* vehicle and spot; `PricingStrategy` and `Clock` are injected interfaces, applying the dependency inversion principle. Inheritance among vehicle types is discussed next, since it is the point where the design can become bloated without need."]),
      h(["4. Código: tipos, veículos e vagas", "4. Code: types, vehicles and spots"]),
      p(["Começamos pelo vocabulário do domínio. Os tipos de veículo e de vaga são enumerações; a regra *qual veículo cabe em qual vaga* vive na própria vaga, que é quem tem a informação. Em vez de uma hierarquia `Car`, `Motorcycle`, `Van` com métodos diferentes, usamos **uma única classe `Vehicle` com um tipo**, pois os veículos só diferem por dado, não por comportamento. Criar subclasses sem comportamento próprio é um sinal clássico de herança desnecessária (YAGNI); se um dia veículos ganharem regras próprias, a refatoração é simples.", "We start with the domain vocabulary. Vehicle and spot types are enumerations; the rule *which vehicle fits which spot* lives in the spot itself, which has the information. Instead of a `Car`, `Motorcycle`, `Van` hierarchy with different methods, we use **a single `Vehicle` class with a type**, since vehicles only differ by data, not behavior. Creating subclasses without behavior of their own is a classic sign of unnecessary inheritance (YAGNI); if vehicles one day gain rules of their own, refactoring is simple."]),
      code(`// ---------- domain/types.ts ----------
export type VehicleType = "motorcycle" | "car" | "van";
export type SpotSize = "small" | "medium" | "large";

export class Vehicle {
  constructor(readonly plate: string, readonly type: VehicleType) {
    if (!plate.trim()) throw new Error("plate is required");          // valid from birth
  }
}

// Which spot sizes accept which vehicle, smallest fit first
const ACCEPTS: Record<VehicleType, SpotSize[]> = {
  motorcycle: ["small", "medium", "large"],
  car: ["medium", "large"],
  van: ["large"],
};

// ---------- domain/ParkingSpot.ts ----------
export class ParkingSpot {
  private occupiedBy?: string;                                       // plate, undefined = free
  constructor(readonly id: string, readonly floor: number, readonly size: SpotSize) {}

  isFree() { return this.occupiedBy === undefined; }
  fits(v: Vehicle) { return ACCEPTS[v.type].includes(this.size); }

  /** Atomic "check and take": in a single-threaded runtime this is safe because there is no await inside. */
  tryTake(v: Vehicle): boolean {
    if (!this.isFree() || !this.fits(v)) return false;
    this.occupiedBy = v.plate;
    return true;
  }
  release() { this.occupiedBy = undefined; }
}`),
      h(["5. Código: andares, ticket e relógio", "5. Code: floors, ticket and clock"]),
      p(["O `Floor` sabe encontrar e tomar uma vaga. Uma sutileza importante: a busca pela *menor vaga que sirva* evita desperdiçar vagas grandes com motos. Como as vagas são ordenadas por tamanho na construção, a primeira que atende é a mais justa. O `Ticket` é **imutável**: representa um fato (o carro entrou às 10h na vaga A-3) e, por isso, nunca muda.", "The `Floor` knows how to find and take a spot. An important subtlety: searching for the *smallest spot that fits* avoids wasting large spots on motorcycles. Since spots are ordered by size at construction, the first that fits is the tightest. The `Ticket` is **immutable**: it represents a fact (the car entered at 10:00 in spot A-3) and therefore never changes."]),
      code(`// ---------- domain/Floor.ts ----------
const ORDER: Record<SpotSize, number> = { small: 0, medium: 1, large: 2 };

export class Floor {
  private readonly spots: ParkingSpot[];
  constructor(readonly number: number, spots: ParkingSpot[]) {
    this.spots = [...spots].sort((a, b) => ORDER[a.size] - ORDER[b.size]);   // tightest fit first
  }
  /** Finds AND takes a spot, so callers never see a spot that someone else already got. */
  allocate(v: Vehicle): ParkingSpot | undefined {
    for (const s of this.spots) if (s.tryTake(v)) return s;
    return undefined;
  }
  freeCount() { return this.spots.filter((s) => s.isFree()).length; }
}

// ---------- domain/Ticket.ts ----------
export class Ticket {
  constructor(readonly id: string, readonly vehicle: Vehicle, readonly spot: ParkingSpot, readonly enteredAt: Date) {}
}

export interface Receipt { ticketId: string; plate: string; minutes: number; fee: number }

// ---------- domain/Clock.ts ----------
export interface Clock { now(): Date }
export class SystemClock implements Clock { now() { return new Date(); } }`),
      h(["6. Estratégia de preço com Strategy", "6. Pricing strategy with Strategy"]),
      p(["O preço é o ponto de variação mais evidente: hoje cobramos por hora, amanhã haverá teto diário, promoção de fim de semana, plano mensal e tolerância de 15 minutos. Se o cálculo estivesse dentro de `ParkingLot` com `if`s, cada regra nova exigiria editar a classe central (violando o princípio aberto/fechado). Com o padrão **Strategy**, cada política é uma classe com o mesmo contrato, injetada no estacionamento. Cobrar por hora aqui significa arredondar para cima: 61 minutos contam como 2 horas, e há um período de tolerância em que não se cobra nada. Para dinheiro, usamos **centavos inteiros** em vez de `number` decimal, evitando erros de ponto flutuante.", "Pricing is the most evident point of variation: today we charge hourly, tomorrow there will be a daily cap, weekend promotion, monthly plan and a 15-minute grace period. If the calculation were inside `ParkingLot` with `if`s, each new rule would require editing the central class (violating the open/closed principle). With the **Strategy** pattern, each policy is a class with the same contract, injected into the lot. Charging hourly here means rounding up: 61 minutes count as 2 hours, and there is a grace period in which nothing is charged. For money, we use **integer cents** instead of decimal `number`, avoiding floating-point errors."]),
      code(`// ---------- pricing/PricingStrategy.ts ----------
export interface PricingStrategy {
  /** Fee in cents. Contract: never negative; zero for stays within the grace period. */
  fee(ticket: Ticket, exitAt: Date): number;
}

const minutesBetween = (a: Date, b: Date) => Math.max(0, Math.ceil((b.getTime() - a.getTime()) / 60_000));

export class HourlyPricing implements PricingStrategy {
  constructor(
    private readonly centsPerHour: Record<VehicleType, number>,
    private readonly graceMinutes = 15,
  ) {}
  fee(t: Ticket, exitAt: Date) {
    const minutes = minutesBetween(t.enteredAt, exitAt);
    if (minutes <= this.graceMinutes) return 0;
    const hours = Math.ceil(minutes / 60);                      // partial hour counts as a full hour
    return hours * this.centsPerHour[t.vehicle.type];
  }
}

/** Decorator-style strategy: wraps another strategy and applies a daily cap. */
export class DailyCapPricing implements PricingStrategy {
  constructor(private readonly inner: PricingStrategy, private readonly capCentsPerDay: number) {}
  fee(t: Ticket, exitAt: Date) {
    const days = Math.max(1, Math.ceil(minutesBetween(t.enteredAt, exitAt) / (24 * 60)));
    return Math.min(this.inner.fee(t, exitAt), this.capCentsPerDay * days);
  }
}

/** Weekend promotion: composes with any other strategy. */
export class WeekendDiscountPricing implements PricingStrategy {
  constructor(private readonly inner: PricingStrategy, private readonly discount = 0.2) {}
  fee(t: Ticket, exitAt: Date) {
    const weekend = [0, 6].includes(t.enteredAt.getDay());
    const base = this.inner.fee(t, exitAt);
    return weekend ? Math.round(base * (1 - this.discount)) : base;
  }
}`),
      p(["Observe que `DailyCapPricing` e `WeekendDiscountPricing` recebem outra estratégia e a *decoram*: o Strategy se combina com o Decorator para compor regras sem explodir o número de classes. A política final é montada em um só lugar, o *composition root*, e pode vir de configuração.", "Note that `DailyCapPricing` and `WeekendDiscountPricing` receive another strategy and *decorate* it: Strategy combines with Decorator to compose rules without exploding the number of classes. The final policy is assembled in a single place, the *composition root*, and can come from configuration."]),
      h(["7. O orquestrador: ParkingLot", "7. The orchestrator: ParkingLot"]),
      p(["`ParkingLot` é a **fachada** do sistema: a entrada e a saída são as duas operações públicas. Ele depende apenas de abstrações (`PricingStrategy`, `Clock`) e de uma fonte de identificadores, todas injetadas. Os tickets ativos ficam em um `Map` indexado pelo id, o que torna a saída uma busca em O(1). O trabalho de saída tem uma ordem importante: primeiro calcula o valor, depois remove o ticket e, só por fim, libera a vaga, para que nada fique inconsistente se algo falhar no caminho.", "`ParkingLot` is the system's **facade**: entry and exit are the two public operations. It depends only on abstractions (`PricingStrategy`, `Clock`) and an identifier source, all injected. Active tickets sit in a `Map` indexed by id, making exit an O(1) lookup. The exit work has an important order: first compute the fee, then remove the ticket and only at the end free the spot, so nothing is left inconsistent if something fails on the way."]),
      code(`// ---------- ParkingLot.ts ----------
export class LotFullError extends Error { constructor(type: VehicleType) { super("no free spot for " + type); } }
export class UnknownTicketError extends Error { constructor(id: string) { super("unknown or already used ticket " + id); } }
export class AlreadyParkedError extends Error { constructor(plate: string) { super("vehicle already inside: " + plate); } }

export class ParkingLot {
  private readonly active = new Map<string, Ticket>();           // ticketId -> ticket
  private readonly insidePlates = new Set<string>();
  private seq = 0;

  constructor(
    private readonly floors: Floor[],
    private readonly pricing: PricingStrategy,
    private readonly clock: Clock = new SystemClock(),
  ) {}

  enter(v: Vehicle): Ticket {
    if (this.insidePlates.has(v.plate)) throw new AlreadyParkedError(v.plate);
    for (const floor of this.floors) {
      const spot = floor.allocate(v);                           // find AND take, atomically
      if (spot) {
        const ticket = new Ticket("T" + ++this.seq, v, spot, this.clock.now());
        this.active.set(ticket.id, ticket);
        this.insidePlates.add(v.plate);
        return ticket;
      }
    }
    throw new LotFullError(v.type);
  }

  exit(ticketId: string): Receipt {
    const ticket = this.active.get(ticketId);
    if (!ticket) throw new UnknownTicketError(ticketId);        // also blocks reusing a ticket
    const exitAt = this.clock.now();
    const fee = this.pricing.fee(ticket, exitAt);               // compute first: it may throw
    this.active.delete(ticketId);
    this.insidePlates.delete(ticket.vehicle.plate);
    ticket.spot.release();                                      // free the spot last
    return { ticketId, plate: ticket.vehicle.plate, minutes: minutesBetween(ticket.enteredAt, exitAt), fee };
  }

  availability(): { floor: number; free: number }[] {
    return this.floors.map((f) => ({ floor: f.number, free: f.freeCount() }));
  }
}`),
      h(["8. Montagem e uso", "8. Assembly and usage"]),
      code(`// ---------- main.ts (composition root) ----------
const spotsOf = (floor: number, small: number, medium: number, large: number) => [
  ...Array.from({ length: small }, (_, i) => new ParkingSpot("F" + floor + "-S" + (i + 1), floor, "small")),
  ...Array.from({ length: medium }, (_, i) => new ParkingSpot("F" + floor + "-M" + (i + 1), floor, "medium")),
  ...Array.from({ length: large }, (_, i) => new ParkingSpot("F" + floor + "-L" + (i + 1), floor, "large")),
];

const pricing = new WeekendDiscountPricing(
  new DailyCapPricing(new HourlyPricing({ motorcycle: 300, car: 600, van: 1000 }), 4000),
);
const lot = new ParkingLot([new Floor(1, spotsOf(1, 5, 20, 3)), new Floor(2, spotsOf(2, 5, 20, 3))], pricing);

const ticket = lot.enter(new Vehicle("ABC-1234", "car"));
console.log(ticket.spot.id);                 // F1-M1
const receipt = lot.exit(ticket.id);
console.log(receipt.fee / 100);              // fee in currency units

// ---------- test with a controllable clock (no waiting) ----------
class FakeClock implements Clock { constructor(public t: Date) {} now() { return this.t; } advance(min: number) { this.t = new Date(this.t.getTime() + min * 60_000); } }
const clock = new FakeClock(new Date("2025-03-05T10:00:00Z"));     // a Wednesday
const testLot = new ParkingLot([new Floor(1, spotsOf(1, 0, 1, 0))], new HourlyPricing({ motorcycle: 300, car: 600, van: 1000 }), clock);
const t = testLot.enter(new Vehicle("AAA-0001", "car"));
clock.advance(61);
console.log(testLot.exit(t.id).fee);          // 1200: 61 min = 2 hours x 600
// testLot.enter(new Vehicle("BBB-0002", "car")) before exit would throw LotFullError`),
      h(["9. Fluxo de entrada e saída", "9. Entry and exit flow"]),
      code(`sequenceDiagram
  participant G as Gate
  participant L as ParkingLot
  participant F as Floor
  participant S as ParkingSpot
  participant P as PricingStrategy
  G->>L: enter(vehicle)
  L->>F: allocate(vehicle)
  F->>S: tryTake(vehicle)
  S-->>F: true
  F-->>L: spot
  L-->>G: ticket
  Note over G,L: ...time passes...
  G->>L: exit(ticket.id)
  L->>P: fee(ticket, now)
  P-->>L: cents
  L->>S: release()
  L-->>G: receipt`),
      h(["10. Concorrência: nunca duas pessoas na mesma vaga", "10. Concurrency: never two cars in the same spot"]),
      p(["O requisito mais sutil é a concorrência. Em um estacionamento real, várias cancelas chamam `enter` ao mesmo tempo. A falha clássica é a **condição de corrida do tipo verificar-e-agir** (*check-then-act*): duas threads leem que a vaga está livre e ambas a tomam. O código acima evita isso concentrando verificar e tomar em `tryTake`, uma operação **atômica**. Em TypeScript, executando em Node.js, o código síncrono não é interrompido no meio, então basta não haver um `await` entre a verificação e a atribuição. Em Java, C# ou Go, seria preciso garantir a atomicidade de forma explícita. As opções, da mais simples à mais escalável:", "The subtlest requirement is concurrency. In a real lot, several gates call `enter` at the same time. The classic failure is the **check-then-act race condition**: two threads read that the spot is free and both take it. The code above avoids this by concentrating check and take in `tryTake`, an **atomic** operation. In TypeScript running on Node.js, synchronous code is not interrupted midway, so it is enough to have no `await` between the check and the assignment. In Java, C# or Go, atomicity would have to be ensured explicitly. The options, from simplest to most scalable:"]),
      table([["Estratégia", "Strategy"], ["Como funciona", "How it works"], ["Quando usar", "When to use"]],
        [["Trava por vaga (`synchronized` / `Mutex`)", "Per-spot lock (`synchronized` / `Mutex`)"], ["`tryTake` é uma seção crítica protegida por uma trava", "`tryTake` is a critical section protected by a lock"], ["Um só processo, poucas vagas e baixa contenção", "A single process, few spots and low contention"]],
        [["Operação atômica de hardware (CAS)", "Hardware atomic operation (CAS)"], ["`compareAndSet(free, taken)` sem travas (`AtomicReference` em Java)", "`compareAndSet(free, taken)` without locks (`AtomicReference` in Java)"], ["Alta contenção, em um só processo", "High contention, in a single process"]],
        [["Atualização condicional no banco", "Conditional database update"], ["`UPDATE spots SET taken = true WHERE id = ? AND taken = false`; testa as linhas afetadas", "`UPDATE spots SET taken = true WHERE id = ? AND taken = false`; check affected rows"], ["Várias instâncias da aplicação com um banco compartilhado", "Several app instances with a shared database"]],
        [["Trava otimista (versão)", "Optimistic lock (version)"], ["Coluna `version`; o `UPDATE` só vale se a versão não mudou", "A `version` column; the `UPDATE` only applies if the version has not changed"], ["Contenção baixa a média; repete em caso de conflito", "Low to medium contention; retry on conflict"]],
        [["Trava distribuída (Redis, ZooKeeper)", "Distributed lock (Redis, ZooKeeper)"], ["Uma trava externa por vaga ou por andar", "An external lock per spot or per floor"], ["Quando não há banco transacional; cuidado com expiração e falhas", "When there is no transactional database; mind expiry and failures"]],
      ),
      code(`-- Multi-instance version: the database arbitrates. The WHERE clause makes it atomic.
UPDATE parking_spot
   SET occupied_by = :plate, version = version + 1
 WHERE id = :spot_id
   AND occupied_by IS NULL;           -- 0 rows affected = someone else got it, try the next spot

-- Release on exit
UPDATE parking_spot SET occupied_by = NULL, version = version + 1 WHERE id = :spot_id AND occupied_by = :plate;

-- One ticket per vehicle inside: a partial unique index prevents duplicates even under races
CREATE UNIQUE INDEX one_active_ticket_per_plate ON ticket (plate) WHERE exited_at IS NULL;`),
      p(["Outros pontos de concorrência: o contador de tickets (`seq`) em um ambiente multithread exigiria um incremento atômico (ou um gerador de IDs único, como UUID ou uma sequência do banco); e o `Map` de tickets ativos precisaria de uma estrutura segura para concorrência (`ConcurrentHashMap`). Dois carros com a mesma placa tentando entrar simultaneamente são tratados pelo índice único parcial. Por fim, o **fluxo de saída** deve ser idempotente: se a cancela repetir a chamada por timeout, o sistema não deve cobrar duas vezes; o ticket já removido gera `UnknownTicketError`, e uma versão mais robusta devolveria o mesmo recibo guardado.", "Other concurrency points: the ticket counter (`seq`) in a multithreaded environment would require an atomic increment (or a unique ID generator such as UUID or a database sequence); and the `Map` of active tickets would need a concurrency-safe structure (`ConcurrentHashMap`). Two cars with the same plate trying to enter simultaneously are handled by the partial unique index. Finally, the **exit flow** should be idempotent: if the gate repeats the call due to a timeout, the system must not charge twice; the already removed ticket raises `UnknownTicketError`, and a more robust version would return the same stored receipt."]),
      h(["11. Princípios e padrões aplicados", "11. Principles and patterns applied"]),
      table([["Decisão", "Decision"], ["Princípio ou padrão", "Principle or pattern"], ["Benefício", "Benefit"]],
        [["`PricingStrategy` injetada", "Injected `PricingStrategy`"], ["Strategy, OCP, DIP", "Strategy, OCP, DIP"], ["Novas regras de preço sem tocar em `ParkingLot`", "New pricing rules without touching `ParkingLot`"]],
        [["`DailyCapPricing` e `WeekendDiscountPricing`", "`DailyCapPricing` and `WeekendDiscountPricing`"], ["Decorator sobre Strategy", "Decorator over Strategy"], ["Regras combináveis", "Combinable rules"]],
        [["`ParkingLot` com `enter` e `exit`", "`ParkingLot` with `enter` and `exit`"], ["Facade", "Facade"], ["Interface simples para as cancelas", "Simple interface for the gates"]],
        [["`Clock` injetado", "Injected `Clock`"], ["DIP, testabilidade", "DIP, testability"], ["Testes sem esperar horas", "Tests without waiting hours"]],
        [["`Vehicle` único com tipo", "Single `Vehicle` with a type"], ["YAGNI, KISS", "YAGNI, KISS"], ["Sem hierarquia sem comportamento", "No hierarchy without behavior"]],
        [["`ParkingSpot.fits` e `tryTake`", "`ParkingSpot.fits` and `tryTake`"], ["Tell, don't ask; encapsulamento", "Tell, don't ask; encapsulation"], ["Regra e estado juntos e atômicos", "Rule and state together and atomic"]],
        [["`Ticket` imutável", "Immutable `Ticket`"], ["Objeto de valor", "Value object"], ["Sem estados inconsistentes", "No inconsistent states"]],
      ),
      h(["12. Extensões", "12. Extensions"]),
      p(["Um bom design se prova quando os requisitos mudam. Vejamos como acomodar as extensões mais prováveis, e o que exigiria alterar:", "A good design proves itself when requirements change. Let us see how to accommodate the most likely extensions, and what each would require changing:"]),
      table([["Extensão", "Extension"], ["Como acomodar", "How to accommodate"], ["O que muda", "What changes"]],
        [["Novo tipo de veículo (caminhão)", "New vehicle type (truck)"], ["Adicionar o valor ao tipo, à tabela `ACCEPTS` e ao preço por hora", "Add the value to the type, the `ACCEPTS` table and the hourly price"], ["Dados, não lógica", "Data, not logic"]],
        [["Planos mensais e convênios", "Monthly plans and partnerships"], ["Nova `PricingStrategy` que consulta uma lista de assinantes", "A new `PricingStrategy` that queries a subscriber list"], ["Uma classe nova; `ParkingLot` intacto", "One new class; `ParkingLot` intact"]],
        [["Vagas para deficientes e carregadores elétricos", "Disabled spots and EV chargers"], ["Atributos da vaga (`features`) e do veículo (`needs`); `fits` passa a comparar os dois", "Spot attributes (`features`) and vehicle needs; `fits` compares both"], ["`ParkingSpot.fits` e os tipos", "`ParkingSpot.fits` and the types"]],
        [["Escolha de vaga (mais perto da saída, mais barata)", "Spot choice (closest to exit, cheapest)"], ["Extrair `SpotAllocationStrategy` com `choose(floors, vehicle)`", "Extract `SpotAllocationStrategy` with `choose(floors, vehicle)`"], ["Um segundo Strategy, injetado", "A second injected Strategy"]],
        [["Reservas antecipadas", "Advance reservations"], ["Estado `reserved` na vaga e `Reservation` com janela de tempo; vaga passa a ter agenda", "A `reserved` spot state and `Reservation` with a time window; the spot gains a schedule"], ["Nova entidade e regras de conflito de horário", "A new entity and time conflict rules"]],
        [["Pagamento (cartão, Pix, cancela automática)", "Payment (card, instant transfer, automatic gate)"], ["Interface `PaymentGateway` injetada no `exit`; recibo só após pagamento aprovado", "A `PaymentGateway` interface injected into `exit`; receipt only after approved payment"], ["Novo passo no fluxo de saída; considerar o estado do ticket (aberto, pago, finalizado)", "A new step in the exit flow; consider ticket state (open, paid, closed)"]],
        [["Notificações e painéis de vagas livres", "Notifications and free-spot displays"], ["Observer: `ParkingLot` publica `SpotTaken` e `SpotFreed`; painéis assinam", "Observer: `ParkingLot` publishes `SpotTaken` and `SpotFreed`; displays subscribe"], ["Um emissor de eventos no lote", "An event emitter in the lot"]],
        [["Vários estacionamentos e persistência", "Multiple lots and persistence"], ["Repositórios (`TicketRepository`, `SpotRepository`) atrás de interfaces; escopo por `lotId`", "Repositories (`TicketRepository`, `SpotRepository`) behind interfaces; scope by `lotId`"], ["Adapters de banco; o domínio permanece igual", "Database adapters; the domain stays the same"]],
      ),
      code(`// Extension example: a second Strategy for choosing the spot
export interface SpotAllocationStrategy { choose(floors: Floor[], v: Vehicle): ParkingSpot | undefined }
export class FirstFitAllocation implements SpotAllocationStrategy {
  choose(floors: Floor[], v: Vehicle) { for (const f of floors) { const s = f.allocate(v); if (s) return s; } return undefined; }
}
export class LeastCrowdedFloorAllocation implements SpotAllocationStrategy {
  choose(floors: Floor[], v: Vehicle) {
    const byFree = [...floors].sort((a, b) => b.freeCount() - a.freeCount());   // spread the load
    for (const f of byFree) { const s = f.allocate(v); if (s) return s; }
    return undefined;
  }
}
// ParkingLot would receive SpotAllocationStrategy in its constructor instead of looping floors itself.`),
      h(["13. Perguntas que o entrevistador costuma fazer", "13. Questions the interviewer usually asks"]),
      ul(
        ["**Por que `Vehicle` não tem subclasses?** Porque elas só diferem por dados. Subclasses entrariam se cada tipo tivesse comportamento próprio (por exemplo, regras de estacionamento diferentes).", "**Why does `Vehicle` have no subclasses?** Because they only differ by data. Subclasses would come in if each type had behavior of its own (for example, different parking rules)."],
        ["**Como escalar para centenas de andares e milhares de vagas?** Manter um índice de vagas livres por tamanho (`Map<SpotSize, Set<ParkingSpot>>` ou uma fila de prioridade) para alocar em O(1) ou O(log n), em vez de varrer todas as vagas.", "**How to scale to hundreds of floors and thousands of spots?** Keep an index of free spots by size (`Map<SpotSize, Set<ParkingSpot>>` or a priority queue) to allocate in O(1) or O(log n) instead of scanning all spots."],
        ["**E se a aplicação cair?** Persistir tickets e ocupação em um banco; ao reiniciar, reconstruir o estado em memória a partir dele. Por isso as operações devem ser idempotentes.", "**What if the application crashes?** Persist tickets and occupancy in a database; on restart, rebuild the in-memory state from it. That is why operations should be idempotent."],
        ["**Como testar o preço?** Com um `Clock` falso e tickets construídos diretamente, cobrindo os limites: tolerância, 60 e 61 minutos, virada de dia e fim de semana.", "**How to test pricing?** With a fake `Clock` and directly built tickets, covering the boundaries: grace period, 60 and 61 minutes, day rollover and weekend."],
        ["**Por que o dinheiro é inteiro em centavos?** Para evitar erros de arredondamento de ponto flutuante (`0.1 + 0.2`); em sistemas reais, usa-se um tipo `Money` com moeda.", "**Why is money an integer in cents?** To avoid floating-point rounding errors (`0.1 + 0.2`); real systems use a `Money` type with currency."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["O roteiro: requisitos, entidades (substantivos e verbos), relacionamentos, interfaces, fluxos, código e extensões.", "The roadmap: requirements, entities (nouns and verbs), relationships, interfaces, flows, code and extensions."],
        ["`ParkingLot` é a fachada; `Floor` e `ParkingSpot` guardam a organização e o estado; `Ticket` é um valor imutável.", "`ParkingLot` is the facade; `Floor` and `ParkingSpot` hold organization and state; `Ticket` is an immutable value."],
        ["Preço com Strategy (e Decorator para regras combinadas) mantém o aberto/fechado; o relógio injetado viabiliza testes.", "Pricing with Strategy (and Decorator for combined rules) keeps open/closed; the injected clock enables tests."],
        ["Concorrência: verificar e tomar a vaga em uma única operação atômica; com várias instâncias, delegue ao banco por atualização condicional.", "Concurrency: check and take the spot in a single atomic operation; with several instances, delegate to the database through a conditional update."],
        ["Prefira o design simples e deixe os pontos de extensão apenas onde há variação real.", "Prefer the simple design and leave extension points only where there is real variation."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Preciso implementar tudo isso em uma entrevista?** Não. Em 45 minutos, entregue requisitos, entidades, diagrama de classes, o código das classes centrais e a discussão de extensões e concorrência.", "**Do I need to implement all of this in an interview?** No. In 45 minutes, deliver requirements, entities, a class diagram, the code of the core classes and the discussion of extensions and concurrency."],
        ["**Singleton para `ParkingLot`?** Evite: injete a instância única no composition root; assim os testes criam estacionamentos independentes.", "**A Singleton for `ParkingLot`?** Avoid it: inject the single instance at the composition root; this way tests create independent lots."],
        ["**Onde ficam as regras de preço complexas, como feriados?** Em novas estratégias, ou em uma estratégia que consulta um calendário injetado, sempre fora de `ParkingLot`.", "**Where do complex pricing rules, such as holidays, go?** In new strategies, or in a strategy that queries an injected calendar, always outside `ParkingLot`."],
        ["**E o diagrama de estados do ticket?** Um ticket passa por *aberto*, *pago* e *finalizado*; com pagamento externo, vale modelar essas transições com o padrão State.", "**What about the ticket's state diagram?** A ticket goes through *open*, *paid* and *closed*; with external payment, it is worth modeling these transitions with the State pattern."],
      ),
      tip(["Ao apresentar um LLD, narre as decisões: *escolhi isto porque a variação provável é aquilo*. O avaliador não procura o desenho perfeito, e sim o raciocínio que liga requisitos, princípios e padrões.", "When presenting an LLD, narrate the decisions: *I chose this because the likely variation is that*. The evaluator is not looking for the perfect design, but for the reasoning that connects requirements, principles and patterns."]),
    ] },
];
