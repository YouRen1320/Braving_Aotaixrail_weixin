"use strict";
const e = require("../../common/vendor.js"),
  a = require("../../stores/game.js"),
  t = {
    __name: "BackgroundLayer",
    setup(t) {
      const u = a.useGameStore(),
        n = {
          sunny: "/staticPkg7/bg_sunny.png",
          cloudy: "/staticPkg7/bg_sunny.png",
          fog: "/staticPkg6/bg_fog.png",
          snow: "/staticPkg9/bg_snow.png",
          storm: "/staticPkg4/bg_storm.png",
        },
        s = e.ref(n.sunny),
        r = e.ref(""),
        g = e.ref(!1),
        o = e.computed(() => u.currentScene),
        c = e.computed(() => u.weather),
        v = e.computed(() => {
          if (o.value && o.value.bg) {
            const m = {
              back_ground: "staticPkg10",
              evt_takin_beast: "staticPkg1",
              loc_fangyang_temple: "staticPkg1",
              evt_takin_herd: "staticPkg2",
              evt_wild_boar_shadow: "staticPkg2",
              loc_red_birch: "staticPkg2",
              loc_yangpi_gully: "staticPkg2",
              evt_broken_shoe: "staticPkg3",
              evt_notebook: "staticPkg3",
              loc_forest: "staticPkg3",
              loc_mingxing_temple: "staticPkg3",
              loc_river: "staticPkg3",
              bg_night: "staticPkg4",
              bg_storm: "staticPkg4",
              evt_phone_frozen: "staticPkg4",
              evt_shoe_trace: "staticPkg4",
              fog_halluncination: "staticPkg4",
              loc_stone_sea: "staticPkg4",
              evt_mani_pile: "staticPkg5",
              evt_phantom_opera: "staticPkg5",
              evt_rescue_hiker: "staticPkg5",
              loc_nav_stand: "staticPkg10",
              loc_penjing: "staticPkg5",
              loc_plane_wreck: "staticPkg5",
              evt_ranger_patrol: "staticPkg6",
              loc_knife_ridge: "staticPkg6",
              loc_temple: "staticPkg6",
              loc_wengong_temple: "staticPkg6",
              bg_fog: "staticPkg10",
              loc_daye_lake: "staticPkg10",
              loc_sunset_meadow: "staticPkg10",
              back_ground: "staticPkg10",
              bg_sunny: "staticPkg7",
              evt_water_bottle: "staticPkg7",
              loc_lake: "staticPkg7",
              loc_pingan_temple: "staticPkg7",
              loc_spring_water: "staticPkg7",
              loc_stone_sea_giant_ship: "staticPkg7",
              loc_wanxian: "staticPkg7",
              evt_abandoned_tent: "staticPkg8",
              evt_frozen_body: "staticPkg8",
              evt_hypothermia: "staticPkg8",
              evt_lightning_hair: "staticPkg8",
              evt_sunset_cliff: "staticPkg8",
              loc_ridge: "staticPkg8",
              loc_tractor_road: "staticPkg8",
              bg_snow: "staticPkg9",
              loc_baxiantai_ruins: "staticPkg9",
              loc_camp: "staticPkg9",
              loc_village: "staticPkg9",
            };
            return (
              "/" + (m[o.value.bg] || "staticPkg1") + "/" + o.value.bg + ".png"
            );
          }
          const e = c.value || "sunny";
          return n[e] || n.sunny;
        });
      return (
        e.watch(
          v,
          (e) => {
            e !== s.value &&
              ((r.value = s.value),
              (s.value = e),
              (g.value = !0),
              setTimeout(() => {
                (r.value = ""), (g.value = !1);
              }, 1e3));
          },
          { immediate: !0 }
        ),
        (a, t) =>
          e.e({ a: r.value }, r.value ? { b: r.value } : {}, {
            c: s.value,
            d: g.value ? 1 : "",
          })
      );
    },
  },
  u = e._export_sfc(t, [["__scopeId", "data-v-aba94337"]]);
wx.createComponent(u);
