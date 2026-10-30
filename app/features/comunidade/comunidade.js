/* Comunidade da Central — círculo enxuto.
   A casca monta com PrimeComunidade.mount(el, { assetBase, clientId }).
   O ângulo fica no navegador da clínica e segue para o estúdio via
   sessionStorage "prime.estudio.tema". Nada é publicado nem disparado. */
(function () {
  var NOTAS = [
    {
      kicker: "Do nosso time",
      title: "O silêncio entre as entregas acaba aqui",
      body: "A presença da clínica é uma só: site, Instagram, Google e link na bio. O círculo é onde a gente mantém esse fio — uma nota da Prime para toda a base, no tom da casa.",
    },
    {
      kicker: "Próxima volta",
      title: "Um ângulo, em uma frase",
      body: "Espaço, rotina ou um detalhe do cuidado. A frase fica na sua central e o estúdio monta a peça no tom da clínica. Daqui nada vai ao ar.",
    },
  ];

  var SALAS = [
    {
      nicho: "Estética",
      linha: "O espaço e o ritmo do cuidado.",
      file: "stock/ver-amb4-v18-800.webp",
      alt: "Sala de estar clara, com sofás e poltronas, sem pessoas",
    },
    {
      nicho: "Odontologia",
      linha: "A sala e o planejamento, com presença.",
      file: "sala.webp",
      alt: "Sala odontológica vazia, com cadeira e luz dourada",
    },
    {
      nicho: "Saúde",
      linha: "A rotina da casa, com discrição.",
      file: "stock/ave-amb2-v18-800.webp",
      alt: "Recepção clara de clínica, vazia, com árvore e bancos",
    },
  ];

  var HERO = {
    file: "recepcao.webp",
    alt: "Recepção de clínica com espelho de arco dourado e orquídeas",
  };

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function storageKey(clientId) {
    return "prime.circulo.angulo:" + (clientId || "local");
  }

  function readSaved(key) {
    try {
      return localStorage.getItem(key) || "";
    } catch (err) {
      return "";
    }
  }

  function writeSaved(key, value) {
    localStorage.setItem(key, value);
    sessionStorage.setItem("prime.estudio.tema", value);
  }

  function mount(root, opts) {
    opts = opts || {};
    var base = opts.assetBase || "../../../assets/img/";
    if (base.charAt(base.length - 1) !== "/") base += "/";
    var key = storageKey(opts.clientId);
    root.replaceChildren();

    var view = el("section", "circulo");
    view.setAttribute("aria-label", "Comunidade");

    var head = el("header", "circulo-mast");
    head.appendChild(el("p", "circulo-kicker", "Círculo Prime"));
    var h1 = el("h1");
    h1.appendChild(document.createTextNode("Você está "));
    h1.appendChild(el("em", null, "dentro"));
    h1.appendChild(document.createTextNode("."));
    head.appendChild(h1);
    head.appendChild(
      el(
        "p",
        "circulo-lede",
        "Entre uma entrega e outra, o nosso time fala aqui. Você volta com o próximo ângulo da clínica."
      )
    );
    view.appendChild(head);

    var hero = el("figure", "circulo-hero");
    var heroImg = el("img");
    heroImg.src = base + HERO.file;
    heroImg.alt = HERO.alt;
    heroImg.width = 960;
    heroImg.height = 640;
    hero.appendChild(heroImg);
    view.appendChild(hero);

    NOTAS.forEach(function (nota) {
      var card = el("article", "circulo-nota");
      card.appendChild(el("p", "circulo-kicker", nota.kicker));
      card.appendChild(el("h2", null, nota.title));
      card.appendChild(el("p", null, nota.body));
      view.appendChild(card);
    });

    var salas = el("section", "circulo-salas");
    salas.appendChild(el("p", "circulo-kicker", "O círculo"));
    salas.appendChild(el("h2", null, "A mesma casa"));
    salas.appendChild(
      el(
        "p",
        null,
        "Estética, odontologia e saúde, no padrão da Prime."
      )
    );
    SALAS.forEach(function (sala) {
      var row = el("article", "sala");
      var img = el("img");
      img.src = base + sala.file;
      img.alt = sala.alt;
      img.width = 800;
      img.height = 600;
      row.appendChild(img);
      var text = el("div");
      text.appendChild(el("h3", null, sala.nicho));
      text.appendChild(el("p", null, sala.linha));
      row.appendChild(text);
      salas.appendChild(row);
    });
    view.appendChild(salas);

    var form = el("form", "circulo-ideia");
    form.appendChild(el("p", "circulo-kicker", "Sua parte"));
    form.appendChild(el("h2", null, "O ângulo de hoje"));
    var label = el("label", null, "Escreva o ângulo que o estúdio deve montar.");
    label.htmlFor = "circulo-angulo";
    form.appendChild(label);
    var field = el("textarea");
    field.id = "circulo-angulo";
    field.name = "angulo";
    field.maxLength = 280;
    field.required = true;
    field.placeholder = "A luz da recepção no fim da tarde";
    field.value = readSaved(key);
    form.appendChild(field);
    var button = el("button", "btn", "Guardar para o estúdio");
    button.type = "submit";
    form.appendChild(button);
    var status = el("p", "circulo-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    if (field.value) status.textContent = "Seu ângulo está guardado nesta central.";
    form.appendChild(status);
    form.appendChild(
      el("p", "circulo-fine", "Fica na sua central. O nosso time não dispara mensagem daqui.")
    );
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var texto = field.value.replace(/\s+/g, " ").trim();
      if (!texto) {
        status.dataset.tone = "erro";
        status.textContent = "Escreva o ângulo em uma frase.";
        field.focus();
        return;
      }
      try {
        writeSaved(key, texto);
      } catch (err) {
        status.dataset.tone = "erro";
        status.textContent = "Não foi possível guardar neste navegador.";
        return;
      }
      field.value = texto;
      status.dataset.tone = "";
      status.textContent = "Guardado. No estúdio, esse ângulo está pronto para virar peça.";
      root.dispatchEvent(
        new CustomEvent("prime-circulo-angulo", { bubbles: true, detail: { tema: texto } })
      );
    });
    view.appendChild(form);

    root.appendChild(view);
  }

  window.PrimeComunidade = { mount: mount };
})();
