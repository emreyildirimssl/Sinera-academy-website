// Generated from Main.dc.html (Claude Design). Do not edit by hand.
window.DC_REGIONS = ["<sc-for list=\"{{ tabs }}\" as=\"tb\" hint-placeholder-count=\"5\">\n<button type=\"button\" role=\"tab\" aria-selected=\"{{ tb.selected }}\" onClick=\"{{ tb.pick }}\" style=\"{{ tb.style }}\">{{ tb.label }}</button>\n</sc-for>", "<sc-for list=\"{{ tabs }}\" as=\"tb\" hint-placeholder-count=\"5\"><span style=\"{{ tb.dot }}\"></span></sc-for>", "<sc-for list=\"{{ options }}\" as=\"item\" hint-placeholder-count=\"5\">\n<div style=\"border: 1px solid #ECECEC; border-radius: 12px; padding: 20px 24px; background: #FCFCFC\">\n<div style=\"display: flex; gap: 16px; align-items: flex-start\">\n<span style=\"flex: 0 0 auto; width: 32px; height: 32px; border-radius: 8px; background: #252A34; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px\">{{ item.key }}</span>\n<p style=\"margin: 0; font-size: 16px; line-height: 1.55; color: #3E3A39\">{{ item.text }}</p>\n</div>\n<div role=\"group\" aria-label=\"{{ item.groupLabel }}\" style=\"margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px\">\n<sc-for list=\"{{ item.levels }}\" as=\"lv\" hint-placeholder-count=\"4\">\n<button type=\"button\" aria-pressed=\"{{ lv.pressed }}\" onClick=\"{{ lv.pick }}\" style=\"{{ lv.style }}\">{{ lv.label }}</button>\n</sc-for>\n</div>\n<sc-if value=\"{{ revealed }}\" hint-placeholder-val=\"{{ false }}\">\n<div style=\"margin-top: 16px; padding-top: 16px; border-top: 1px solid #ECECEC; display: flex; flex-wrap: wrap; gap: 8px 24px; align-items: baseline\">\n<span style=\"font-size: 16px; color: #545454\">Uzman: <strong style=\"{{ item.expertStyle }}\">{{ item.expert }}</strong></span>\n<span style=\"{{ item.matchStyle }}\">{{ item.matchLabel }}</span>\n<p style=\"margin: 0; flex: 1 1 100%; font-size: 16px; line-height: 1.55; color: #545454\">{{ item.reason }}</p>\n</div>\n</sc-if>\n</div>\n</sc-for>", "<sc-if value=\"{{ true }}\"><button type=\"button\" onClick=\"{{ reveal }}\" disabled=\"{{ notReady }}\" style=\"{{ revealStyle }}\">Uzman değerlendirmesini göster</button></sc-if>", "<sc-if value=\"{{ notReady }}\" hint-placeholder-val=\"{{ true }}\">\n<span style=\"font-size: 14px; color: #6B6B6B\">Beş hamleyi de değerlendirdikten sonra etkinleşir.</span>\n</sc-if>", "<sc-if value=\"{{ revealed }}\" hint-placeholder-val=\"{{ false }}\">\n<div style=\"margin-top: 32px; padding: 28px 32px; border-radius: 12px; background: #252A34; color: #C9CDD4; display: flex; flex-direction: column; gap: 12px\">\n<p style=\"margin: 0; font-size: 26px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.027em; line-height: 1.25\">Beş hamlenin <span style=\"color: #FF3B45\">{{ matches }}</span> tanesinde uzmanla aynı değerlendirmeyi yaptınız.</p>\n<sc-if value=\"{{ cFlag }}\" hint-placeholder-val=\"{{ false }}\">\n<p style=\"margin: 0\">C'yi \"Etkili\" veya \"Çok etkili\" olarak değerlendirdiniz. Envanter raporunda, ters etki yapabilecek kararların etkili görülmesi ayrı bir bulgu olarak gösterilir.</p>\n</sc-if>\n<p style=\"margin: 0\">Ekibiniz bu türden vakalarla değerlendirilir.</p>\n<a href=\"#basvuru\" style=\"align-self: flex-start; margin-top: 4px; display: inline-flex; align-items: center; min-height: 48px; padding: 0 22px; border-radius: 8px; background: #E3000E; color: #FFFFFF; text-decoration: none; font-family: Inter, sans-serif; font-weight: 500\">Kurucu Firma Programı'na başvurun</a>\n</div>\n</sc-if>"];
window.DC_COMPONENT = function (DCLogic) {

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { ratings: {}, revealed: false, submitted: false, slide: 0, auto: true };
  }
  componentDidMount() {
    var self = this;
    this.timer = setInterval(function () { if (self.state.auto) self.setState({ slide: (self.state.slide + 1) % 5 }); }, 6000);
  }
  componentWillUnmount() { if (this.timer) clearInterval(this.timer); }
  renderVals() {
    var accent = this.props.accent ?? '#E3000E';
    var self = this;
    var levels = ['Çok etkili', 'Etkili', 'Etkisiz', 'Ters etki yapar'];
    var data = [
      { key: 'A', text: '"Özetle üç yeni jeneratöre ihtiyacınız var; güç aralıklarını netleştirip teklifi hazırlayayım."', expert: 'Etkisiz', reason: 'Müşterinin talebini tekrarlar, ancak bu talebin arkasındaki sorunu ve etkisini özete taşımaz.' },
      { key: 'B', text: '"Buradan şunu anlıyorum: Asıl mesele şantiyelerde arıza kaynaklı yaşanan gecikmeler. Bunun sonucunda bir ceza ödemişsiniz; konu yönetim kurulunda da size kadar gelmiş. Üç yeni jeneratör bu sorunun çözümünde bir adım. Doğru özetliyor muyum?"', expert: 'Çok etkili', reason: 'Yaşanan sorunu, işletmeye etkisini ve müşterinin üzerindeki baskıyı birbirine bağlar; ardından özetini müşteriye doğrulatır.' },
      { key: 'C', text: '"Filonuz yaşlanmış; üç yeni jeneratör yerine bakım sözleşmesiyle tüm filoyu yenilemenizi öneririm."', expert: 'Ters etki yapar', reason: 'Doğrulanmamış bir çözümü müşterinin talebinin önüne koyar ve Oya Hanım’ın kararını geçersiz sayar.' },
      { key: 'D', text: '"Arızaları, cezayı, filonun yaşını ve kiralama maliyetlerini yazılı olarak göndereyim; teklifi bu özete göre hazırlayalım."', expert: 'Etkili', reason: 'Önemli unsurları bir araya getirir, ancak bunlar arasındaki ilişkiyi kurmaz ve özetini müşteriye doğrulatmaz.' },
      { key: 'E', text: '"Yönetim kurulu bu konuda ne bekliyor? Kurula birlikte bir sunum yapmamız işinizi kolaylaştırır mı?"', expert: 'Etkisiz', reason: 'Mevcut konuyu özetlemek yerine yönetim kurulu sunumuna geçer; müşterinin kişisel baskısını yeterince anlamadan yeni bir çalışma önerir.' }
    ];
    var r = this.state.ratings;
    var revealed = this.state.revealed;
    var base = 'min-height: 44px; padding: 8px 16px; border-radius: 8px; font: 600 14px/1.2 Manrope, system-ui, sans-serif; cursor: pointer; ';
    var off = base + 'border: 1px solid #C8C8C8; background: #FFFFFF; color: #1A1A1A;';
    var on = base + 'border: 1px solid #252A34; background: #252A34; color: #FFFFFF;';
    var matches = 0;
    var options = data.map(function (o) {
      var picked = r[o.key];
      var match = picked === o.expert;
      if (match) matches += 1;
      return {
        key: o.key,
        text: o.text,
        expert: o.expert,
        reason: o.reason,
        groupLabel: 'Hamle ' + o.key + ' için değerlendirme',
        expertStyle: o.expert === 'Ters etki yapar' ? 'color: #C0000C' : 'color: #1A1A1A',
        matchLabel: picked ? (match ? 'Sizin değerlendirmeniz: aynı' : 'Sizin değerlendirmeniz: ' + picked) : '',
        matchStyle: match ? 'font-size: 14px; font-weight: 700; color: #1A7F4B' : 'font-size: 14px; color: #6B6B6B',
        levels: levels.map(function (l) {
          var sel = picked === l;
          return {
            label: l,
            pressed: sel ? 'true' : 'false',
            style: sel ? on : off,
            pick: function () {
              var next = Object.assign({}, self.state.ratings);
              next[o.key] = l;
              self.setState({ ratings: next });
            }
          };
        })
      };
    });
    var notReady = data.some(function (o) { return !r[o.key]; });
    var revealBase = 'min-height: 52px; padding: 0 26px; border-radius: 8px; border: 0; font: 500 16px/1 Inter, system-ui, sans-serif; ';
    var slide = this.state.slide;
    var tabLabels = ['Satıcı', 'Yönetici farkı', 'Ekip', 'Eğilimler', 'Reçete'];
    var tabs = tabLabels.map(function (l, k) {
      var sel = k === slide;
      return {
        label: l,
        selected: sel ? 'true' : 'false',
        style: 'min-height: 36px; padding: 6px 12px; border-radius: 8px; font: 600 13px/1.2 Manrope, system-ui, sans-serif; cursor: pointer; ' + (sel ? 'border: 1px solid #252A34; background: #252A34; color: #FFFFFF;' : 'border: 1px solid #DADADA; background: #FFFFFF; color: #3E3A39;'),
        dot: 'width: ' + (sel ? '18px' : '6px') + '; height: 6px; border-radius: 3px; background: ' + (sel ? '#FF3B45' : 'rgba(255, 255, 255, 0.35)'),
        pick: function () { self.setState({ slide: k, auto: false }); }
      };
    });
    return {
      tabs: tabs,
      slideNo: slide + 1,
      vis0: slide === 0 ? 'opacity: 1; visibility: visible' : 'opacity: 0; visibility: hidden', hid0: slide === 0 ? 'false' : 'true',
      vis1: slide === 1 ? 'opacity: 1; visibility: visible' : 'opacity: 0; visibility: hidden', hid1: slide === 1 ? 'false' : 'true',
      vis2: slide === 2 ? 'opacity: 1; visibility: visible' : 'opacity: 0; visibility: hidden', hid2: slide === 2 ? 'false' : 'true',
      vis3: slide === 3 ? 'opacity: 1; visibility: visible' : 'opacity: 0; visibility: hidden', hid3: slide === 3 ? 'false' : 'true',
      vis4: slide === 4 ? 'opacity: 1; visibility: visible' : 'opacity: 0; visibility: hidden', hid4: slide === 4 ? 'false' : 'true',
      accent: accent,
      options: options,
      revealed: revealed,
      notReady: notReady,
      revealStyle: notReady ? revealBase + 'background: #E2E2E2; color: #6B6B6B; cursor: not-allowed;' : revealBase + 'background: ' + accent + '; color: #FFFFFF; cursor: pointer;',
      reveal: function () { if (!notReady) self.setState({ revealed: true }); },
      matches: matches,
      cFlag: revealed && (r.C === 'Etkili' || r.C === 'Çok etkili'),
      submitted: this.state.submitted,
      notSubmitted: !this.state.submitted,
      submit: function (e) { if (e && e.preventDefault) e.preventDefault(); self.setState({ submitted: true }); }
    };
  }
}

return Component;
};
