"use strict";
const t = require("../common/vendor.js"),
  e = require("../utils/scenes_data.js"),
  s = require("../utils/data/items_data.js"),
  i = require("../utils/data/weather_data.js"),
  a = require("../utils/utils/audio_manager.js"),
  n = require("./meta.js"),
  o = require("../utils/data/roles_data.js"),
  h = require("../utils/scenes/event_scenes.js"),
  r = t.defineStore("game", {
    state: () => ({
      gameState: "idle",
      currentSceneId: "start_001",
      nextSceneId: "",
      player: {
        name: "驴友",
        identity: "普通游客",
        days: 1,
        roleId: "student",
      },
      status: {
        hp: 100,
        hunger: 100,
        sanity: 100,
        maxHp: 100,
        maxHunger: 100,
        maxSanity: 100,
        maxLoad: 20,
        isNight: !1,
      },
      inventory: [],
      equipment: { head: null, body: null, feet: null, hand: null },
      weather: "sunny",
      history: [],
      progress: 0,
      worldFlags: { shuiwozi_water: !0, liang2_blocked: !1 },
      notification: { visible: !1, message: "", type: "normal" },
    }),
    getters: {
      currentScene: (t) => {
        const s = e.scenes[t.currentSceneId] || e.scenes.start_001;
        let i = s.text;
        return (
          s.roleText && t.player.roleId && s.roleText[t.player.roleId]
            ? (i = s.roleText[t.player.roleId])
            : s.weatherText &&
              s.weatherText[t.weather] &&
              (i = s.weatherText[t.weather]),
          { ...s, text: i }
        );
      },
      isAlive: (t) => t.status.hp > 0 && t.status.sanity > 0,
      currentWeatherInfo: (t) => i.weatherData[t.weather],
      hasItem: (t) => (e) => t.inventory.some((t) => t.id === e),
      hasVision: (t) => {
        var e;
        return (
          !t.status.isNight ||
          "gear_headlamp_01" ===
            (null == (e = t.equipment.head) ? void 0 : e.id)
        );
      },
      totalStats: (t) => {
        let e = 0,
          s = 0;
        return (
          Object.values(t.equipment).forEach((t) => {
            t &&
              t.stats &&
              ((e += t.stats.warmth || 0), (s += t.stats.speed || 0));
          }),
          { warmth: e, speed: s }
        );
      },
      playerTraits: (t) => {
        const e = t.player.roleId;
        if (!e) return [];
        const s = o.roles.find((t) => t.id === e);
        return s ? s.traits : [];
      },
      currentLoad: (t) => {
        let e = 0;
        return (
          t.inventory.forEach((t) => (e += t.weight || 0)),
          Object.values(t.equipment).forEach((t) => {
            t && (e += t.weight || 0);
          }),
          parseFloat(e.toFixed(1))
        );
      },
    },
    actions: {
      initGame(t = "student") {
        const e = n.useMetaStore();
        e.loadMeta(), e.incrementRun();
        const s = o.roles.find((e) => e.id === t) || o.roles[0];
        (this.gameState = "playing"),
          (this.currentSceneId = "start_001"),
          (this.nextSceneId = ""),
          (this.player.days = 1),
          (this.player.roleId = s.id),
          (this.player.identity = s.name),
          (this.status = {
            hp: s.stats.maxHp,
            hunger: s.stats.maxHunger,
            sanity: s.stats.maxSanity,
            maxHp: s.stats.maxHp,
            maxHunger: s.stats.maxHunger,
            maxSanity: s.stats.maxSanity,
            maxLoad: s.traits.includes("strong_back") ? 30 : 20,
            isNight: !1,
          }),
          (this.progress = 0),
          (this.inventory = []),
          (this.equipment = { head: null, body: null, feet: null, hand: null }),
          (this.weather = "sunny"),
          (this.history = [`开始旅程: ${s.name}`]),
          (this.notification = { visible: !1, message: "", type: "normal" }),
          a.audioManager.playBGM("wind"),
          s.items.forEach((t) => this.gainItem(t)),
          a.audioManager.playBGM("sunny"),
          (this.worldFlags = {
            shuiwozi_water: Math.random() > 0.4,
            liang2_blocked: Math.random() > 0.8,
          }),
          console.log("World Flags:", this.worldFlags),
          this.saveGame(),
          this.playerTraits.includes("strong_back") &&
            this.showNotification("天赋[铁背]生效：最大负重+10kg", "success"),
          console.log("Game Initialized with role:", s.name);
      },
      gainItem(t) {
        const e = s.items[t];
        e &&
          (this.inventory.push({ ...e }),
          "playing" === this.gameState &&
            this.history.length > 0 &&
            this.showNotification(`获得: ${e.name}`, "normal"));
      },
      useItem(t) {
        const e = this.inventory[t];
        if (e)
          if ("gear" === e.type && e.slot) this.equipItem(t);
          else if ("consumable" === e.type && e.effect) {
            e.effect.hp &&
              (this.status.hp = Math.min(
                this.status.maxHp,
                this.status.hp + e.effect.hp
              )),
              e.effect.hunger &&
                (this.status.hunger = Math.min(
                  this.status.maxHunger,
                  this.status.hunger + e.effect.hunger
                )),
              e.effect.sanity &&
                (this.status.sanity = Math.min(
                  this.status.maxSanity,
                  this.status.sanity + e.effect.sanity
                ));
            let s = e.effect.msg;
            if (
              this.playerTraits.includes("field_medic") &&
              e.effect.hp &&
              e.effect.hp > 0
            ) {
              const t = Math.floor(0.5 * e.effect.hp);
              (this.status.hp = Math.min(
                this.status.maxHp,
                this.status.hp + t
              )),
                (s += ` (医术加成+${t})`);
            }
            s && this.showNotification(s, "success"),
              this.inventory.splice(t, 1),
              this.saveGame();
          } else this.showNotification("暂时无法使用该物品", "negative");
      },
      equipItem(e) {
        const s = this.inventory[e];
        if (!s || !s.slot) return;
        const i = s.slot,
          a = this.equipment[i];
        this.inventory.splice(e, 1),
          a && this.inventory.push(a),
          (this.equipment[i] = s),
          this.showNotification(`装备: ${s.name}`, "success"),
          this.status.isNight &&
            !n.useMetaStore().tutorialFlags.hasSeenNightTip &&
            (n.useMetaStore().markTutorialSeen("hasSeenNightTip"),
            t.index.showModal({
              title: "夜幕降临",
              content:
                "天黑后视野受限（探索成功率大幅下降）且气温骤降（失温风险剧增）。\n建议尽快寻找庇护所休息，或使用照明工具。",
              showCancel: !1,
              confirmText: "我明白了",
            })),
          this.saveGame();
      },
      unequipItem(t) {
        const e = this.equipment[t];
        e &&
          ((this.equipment[t] = null),
          this.inventory.push(e),
          this.showNotification(`卸下: ${e.name}`, "normal"),
          this.saveGame());
      },
      randomizeWeather() {
        const t = Math.random();
        if (
          ((this.weather =
            t < 0.4
              ? "sunny"
              : t < 0.7
              ? "cloudy"
              : t < 0.85
              ? "fog"
              : t < 0.95
              ? "snow"
              : "storm"),
          a.audioManager.playBGM(this.weather),
          ["storm", "snow"].includes(this.weather))
        ) {
          const t = i.weatherData[this.weather];
          this.showNotification(`警告: ${t.name}`, "negative");
        }
      },
      handleChoice(t) {
        if (
          (this.history.push(`选择: ${t.text}`),
          t.cost && this.applyCost(t.cost),
          t.action && this.handleAction(t.action),
          this.checkSurvival() && t.target)
        ) {
          if ("resume" === t.target)
            return void (this.nextSceneId
              ? (this.moveToScene(this.nextSceneId), (this.nextSceneId = ""))
              : (console.error("No nextSceneId to resume to!"),
                this.moveToScene("node_forest_entry")));
          const s = e.scenes[t.target],
            i = s && !0 === s.safe;
          if (t.target.startsWith("node_") && Math.random() < 0.1 && !i) {
            this.nextSceneId = t.target;
            const s =
              h.randomEventIds[
                Math.floor(Math.random() * h.randomEventIds.length)
              ];
            "evt_storm" === s &&
              ((this.weather = "storm"), a.audioManager.playBGM("wind")),
              e.scenes[s]
                ? (this.moveToScene(s),
                  this.showNotification("遭遇突发事件！", "negative"))
                : (console.error(
                    `Random event scene not found: ${s}, falling back to normal target.`
                  ),
                  this.moveToScene(t.target));
          } else
            t.target.startsWith("node_") && this.randomizeWeather(),
              this.moveToScene(t.target);
        }
      },
      applyCost(e) {
        const s = i.weatherData[this.weather],
          o = s.costCoeff,
          h = this.totalStats;
        let r = (e.hunger || 0) * o;
        if (
          (this.currentLoad > this.status.maxLoad &&
            !n.useMetaStore().tutorialFlags.hasSeenOverloadTip &&
            (n.useMetaStore().markTutorialSeen("hasSeenOverloadTip"),
            t.index.showModal({
              title: "背负超重",
              content: `你携带了过多的物品（${this.currentLoad.toFixed(1)} / ${
                this.status.maxLoad
              } kg）。\n超重会大幅增加体能消耗并降低移动速度。\n请丢弃不必要的物品或寻找更好的背包。`,
              showCancel: !1,
              confirmText: "知道了",
            })),
          this.currentLoad > this.status.maxLoad)
        ) {
          r *= 1 + 0.15 * (this.currentLoad - this.status.maxLoad);
        }
        if (
          (this.playerTraits.includes("high_metabolism") && (r *= 1.25),
          h.speed && h.speed > 0)
        ) {
          r *= 1 - Math.min(0.5, h.speed / 100);
        }
        this.status.hunger = Math.max(0, this.status.hunger - r);
        let c = (e.hp || 0) * o;
        if (s.hpLeak) {
          let t = s.hpLeak;
          h.warmth && (t = Math.max(0, t - 0.5 * h.warmth)), (c += t);
        }
        if (
          (this.status.hunger <= 0 &&
            ((c += 15),
            this.showNotification("饥饿难耐，生命流失！", "negative")),
          this.status.isNight &&
            !this.hasVision &&
            ((e.hp || 0) > 0 || (e.hunger || 0) > 0))
        ) {
          let t = 0.5;
          this.playerTraits.includes("iron_will") && (t = 0.25),
            Math.random() < t &&
              ((c += 35),
              this.showNotification("摸黑赶路摔伤了！(-35HP)", "negative"));
        }
        this.status.hp = Math.max(0, this.status.hp - c);
        let l = e.sanity || 0;
        ["fog", "storm", "snow"].includes(this.weather) &&
          (this.playerTraits.includes("ptsd_storm_calm") &&
          "storm" === this.weather
            ? (l -= 5)
            : (l += 2)),
          this.status.isNight &&
            !this.hasVision &&
            (this.playerTraits.includes("iron_will") || (l += 5)),
          (this.status.sanity = Math.max(0, this.status.sanity - l)),
          this.status.sanity <= 30 &&
            (this.showNotification("意识模糊，耳边传来幻听...", "negative"),
            l > 0 && a.audioManager.playSFX("heartbeat"));
      },
      handleAction(e) {
        switch (e) {
          case "restart":
            t.index.reLaunch({ url: "/pages/home_page" });
            break;
          case "rest":
            if (this.status.hunger < 20)
              return void this.showNotification(
                "太饿了，根本睡不着！",
                "negative"
              );
            this.status.hunger = Math.max(0, this.status.hunger - 20);
            let s = 40;
            "storm" === this.weather && (s = 15),
              "sunny" === this.weather && (s = 60);
            const i = this.inventory.some((t) => "relic_watch" === t.id);
            i
              ? (this.showNotification(
                  "死者的手表在背包里滴答作响...你彻夜难眠",
                  "negative"
                ),
                (s = Math.floor(0.5 * s)),
                (this.status.sanity = Math.max(0, this.status.sanity - 10)))
              : (this.status.sanity = Math.min(
                  this.status.maxSanity,
                  this.status.sanity + 20
                )),
              (this.status.hp = Math.min(
                this.status.maxHp,
                this.status.hp + s
              )),
              (this.status.isNight = !1),
              (this.player.days += 1),
              this.randomizeWeather(),
              i ||
                this.showNotification(
                  `休息一晚 (生命+${s}, 饱食-20)`,
                  "success"
                ),
              this.saveGame();
            break;
          case "loot_supplies":
            this.gainItem("food_001"),
              this.gainItem("water_001"),
              Math.random() > 0.3 && this.gainItem("gear_headlamp_01"),
              this.gainItem("food_001"),
              this.gainItem("water_001"),
              Math.random() > 0.3 && this.gainItem("gear_headlamp_01"),
              (this.status.sanity = Math.max(0, this.status.sanity - 10)),
              a.audioManager.playSFX("heartbeat"),
              this.showNotification("获得物资 (理智-10)", "success");
            break;
          case "check_gear":
            this.showNotification("背包状态良好，暂无异常", "normal");
            break;
          case "sos":
            this.status.sanity = Math.max(0, this.status.sanity - 15);
            let n = 0.3;
            (this.currentSceneId.includes("village") ||
              this.currentSceneId.includes("road")) &&
              (n = 0.9),
              "storm" === this.weather && (n = 0),
              "fog" === this.weather && (n = 0.1),
              "snow" === this.weather && (n = 0.2),
              this.status.isNight && (n *= 0.5),
              Math.random() < n
                ? (this.showNotification(
                    "求教信号发送成功！等待救援...",
                    "success"
                  ),
                  setTimeout(() => {
                    this.moveToScene("end_rescue");
                  }, 1500))
                : (this.showNotification(
                    "无信号 / 天气恶劣无法救援",
                    "negative"
                  ),
                  a.audioManager.playSFX("heartbeat"));
            break;
          case "look_back":
            (this.status.sanity = Math.min(
              this.status.maxSanity,
              this.status.sanity + 5
            )),
              this.showNotification(
                "回望来路，内心平静了一些 (理智+5)",
                "success"
              );
            break;
          case "check_ice_risk":
            const o = this.currentLoad;
            let h = 0.1;
            o > 15 && (h += 0.15 * (o - 15)),
              (h = Math.min(0.9, h)),
              console.log(
                `Ice crossing: Load ${o}kg, Fail Chance ${(100 * h).toFixed(
                  1
                )}%`
              ),
              Math.random() < h
                ? ((this.status.hp -= 40),
                  (this.status.sanity -= 20),
                  this.showNotification("冰面碎裂！落水重伤！", "negative"),
                  a.audioManager.playSFX("ice_crack"),
                  this.moveToScene("node_evt_ice_fail"))
                : this.moveToScene("node_evt_ice_success");
            break;
          case "discard_heavy":
            if (0 === this.inventory.length)
              return void this.showNotification(
                "背包里没有东西可扔！",
                "negative"
              );
            let r = -1,
              c = -1;
            if (
              (this.inventory.forEach((t, e) => {
                t.weight > c && ((c = t.weight), (r = e));
              }),
              -1 !== r)
            ) {
              const t = this.inventory[r];
              this.inventory.splice(r, 1),
                this.showNotification(
                  `扔掉了：${t.name} (${t.weight}kg)`,
                  "normal"
                ),
                this.moveToScene("node_evt_ice_discard_feedback");
            }
            break;
          case "gain_item_flower":
            this.gainItem("special_flower");
            break;
          case "gain_item_water":
            this.gainItem("water_001");
            break;
          case "loot_supplies_big":
            this.gainItem("food_001"),
              this.gainItem("food_001"),
              this.gainItem("water_001"),
              this.gainItem("water_001"),
              this.showNotification("获得大量物资", "success");
            break;
          case "lose_food_water":
            const l = this.inventory.findIndex((t) => "food_001" === t.id);
            l > -1 && this.inventory.splice(l, 1);
            const u = this.inventory.findIndex((t) => "water_001" === t.id);
            u > -1 && this.inventory.splice(u, 1),
              this.showNotification("失去了部分食物和水", "normal");
            break;
          case "lose_random_item":
            if (this.inventory.length > 0) {
              const t = Math.floor(Math.random() * this.inventory.length),
                e = this.inventory[t];
              this.inventory.splice(t, 1),
                this.showNotification(`失去了: ${e.name}`, "negative");
            }
            break;
          case "restore_sanity_full":
            (this.status.sanity = this.status.maxSanity),
              this.showNotification("理智完全恢复", "success");
            break;
          case "die_cold":
            this.die("dead_cold");
            break;
          default:
            console.warn("Unknown action:", e);
        }
      },
      moveToScene(t) {
        var s, i;
        if (e.scenes[t]) {
          if (
            ((this.currentSceneId = t),
            console.log("Moved to scene:", t),
            this.saveGame(),
            t.startsWith("end_"))
          ) {
            const a = n.useMetaStore();
            a.unlockEnding(t),
              (this.gameState = "ended"),
              this.history.push(`结局: ${t}`),
              a.addRun({
                date: new Date().toISOString(),
                roleName:
                  (null == (s = o.roles[this.player.roleId])
                    ? void 0
                    : s.name) || "未知",
                days: this.player.days,
                endingId: t,
                endName:
                  (null == (i = e.scenes[t])
                    ? void 0
                    : i.text.split("\n")[0]) || "未知结局",
              }),
              console.log(`Ending reached: ${t}`);
          }
          e.scenes[t] &&
            "number" == typeof e.scenes[t].progress &&
            (this.progress = e.scenes[t].progress || 0);
        } else console.error(`Scene not found: ${t}`);
      },
      checkSurvival() {
        return this.status.hp <= 0
          ? (this.die(this.status.hunger <= 0 ? "dead_starve" : "dead_cold"),
            a.audioManager.stopBGM(),
            !1)
          : !(this.status.sanity <= 0) ||
              (this.die("dead_sanity"),
              a.audioManager.stopBGM(),
              a.audioManager.playSFX("scream"),
              !1);
      },
      die(t) {
        var s, i;
        (this.gameState = "ended"),
          (this.currentSceneId = "dead_001"),
          this.history.push(`结局: ${t}`),
          this.saveGame();
        const a = n.useMetaStore();
        a.unlockEnding(t),
          a.addRun({
            date: new Date().toISOString(),
            roleName:
              (null == (s = o.roles[this.player.roleId]) ? void 0 : s.name) ||
              "未知",
            days: this.player.days,
            endingId: t,
            endName:
              (null == (i = e.scenes[t]) ? void 0 : i.text.split("\n")[0]) ||
              "死亡结局",
          }),
          console.log(`Player died: ${t}`);
      },
      saveGame() {
        try {
          const e = {
            gameState: this.gameState,
            currentSceneId: this.currentSceneId,
            nextSceneId: this.nextSceneId,
            player: this.player,
            status: this.status,
            inventory: this.inventory,
            equipment: this.equipment,
            weather: this.weather,
            history: this.history,
            progress: this.progress,
          };
          t.index.setStorageSync("braving_aotai_save_v1", e);
        } catch (e) {
          console.error("Save failed", e);
        }
      },
      loadGame() {
        try {
          const e = t.index.getStorageSync("braving_aotai_save_v1");
          if (e && e.currentSceneId)
            return (
              (this.gameState = e.gameState),
              (this.currentSceneId = e.currentSceneId),
              (this.nextSceneId = e.nextSceneId || ""),
              (this.player = e.player),
              (this.status = e.status),
              void 0 === this.status.sanity && (this.status.sanity = 100),
              void 0 === this.status.maxSanity && (this.status.maxSanity = 100),
              void 0 === this.status.maxLoad && (this.status.maxLoad = 20),
              void 0 === this.status.isNight && (this.status.isNight = !1),
              void 0 === this.player.roleId && (this.player.roleId = "student"),
              (this.inventory = e.inventory || []),
              (this.equipment = e.equipment || {
                head: null,
                body: null,
                feet: null,
                hand: null,
              }),
              (this.weather = e.weather || "sunny"),
              (this.history = e.history || []),
              (this.progress = e.progress || 0),
              (this.worldFlags = e.worldFlags || {
                shuiwozi_water: !0,
                liang2_blocked: !1,
              }),
              this.notification ||
                (this.notification = {
                  visible: !1,
                  message: "",
                  type: "normal",
                }),
              "playing" === this.gameState &&
                a.audioManager.playBGM(
                  ["storm", "snow"].includes(this.weather) ? "wind" : "sunny"
                ),
              console.log("Game Loaded"),
              !0
            );
        } catch (e) {
          console.error("Load failed", e);
        }
        return !1;
      },
      clearSave() {
        try {
          t.index.removeStorageSync("braving_aotai_save_v1");
        } catch (e) {}
      },
      showNotification(t, e = "normal") {
        (this.notification = { visible: !0, message: t, type: e }),
          this.notificationTimer && clearTimeout(this.notificationTimer),
          (this.notificationTimer = setTimeout(() => {
            this.notification.visible = !1;
          }, 2500));
      },
    },
  });
exports.useGameStore = r;
