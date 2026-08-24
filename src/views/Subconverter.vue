<template>
  <main class="converter-page">
    <section class="converter-shell">
      <el-card class="converter-card" shadow="never">
        <div slot="header" class="converter-header">
          <div>
            <h1>订阅转换</h1>
            <span class="converter-status">{{ backendVersion || "SubConverter" }}</span>
          </div>
          <el-tooltip content="切换明暗主题" placement="bottom">
            <el-button class="theme-toggle" circle @click="change" aria-label="切换明暗主题">
              <i id="rijian" class="el-icon-sunny"></i>
              <i id="yejian" class="el-icon-moon"></i>
            </el-button>
          </el-tooltip>
        </div>

        <el-form class="converter-form" :model="form" label-width="96px" label-position="left">
          <section class="form-section core-fields">
            <el-form-item label="订阅链接">
              <el-input
                  v-model="form.sourceSubUrl"
                  type="textarea"
                  :rows="4"
                  resize="vertical"
                  placeholder="支持订阅链接或单节点链接，多个链接可换行或使用 | 分隔"
              />
            </el-form-item>
            <el-form-item label="生成类型">
              <el-select v-model="form.clientType" placeholder="选择目标客户端">
                <el-option v-for="(v, k) in options.clientTypes" :key="k" :label="k" :value="v"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="后端地址">
              <el-select
                  v-model="form.customBackend"
                  allow-create
                  filterable
                  @change="selectChanged"
                  placeholder="选择或输入转换后端"
              >
                <el-option v-for="(v, k) in options.customBackend" :key="k" :label="k" :value="v"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="远程配置">
              <el-select
                  v-model="form.remoteConfig"
                  allow-create
                  filterable
                  placeholder="选择或输入远程配置"
              >
                <el-option-group
                    v-for="group in options.remoteConfig"
                    :key="group.label"
                    :label="group.label"
                >
                  <el-option
                      v-for="item in group.options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                  ></el-option>
                </el-option-group>
              </el-select>
            </el-form-item>
          </section>

          <el-collapse class="advanced-collapse">
            <el-collapse-item name="advanced">
              <template slot="title">
                <div class="advanced-title">
                  <span><i class="el-icon-setting"></i>高级设置</span>
                  <span class="optional-label">可选</span>
                </div>
              </template>

              <div class="advanced-grid">
                <el-form-item label="自定义 UA">
                  <el-input v-model="form.diyua" placeholder="后端获取订阅时使用的 User-Agent"/>
                </el-form-item>
                <el-form-item label="订阅名称">
                  <el-input v-model="form.filename" placeholder="支持显示文件名的客户端可见"/>
                </el-form-item>
                <el-form-item label="包含节点">
                  <el-input v-model="form.includeRemarks" placeholder="支持正则表达式"/>
                </el-form-item>
                <el-form-item label="排除节点">
                  <el-input v-model="form.excludeRemarks" placeholder="支持正则表达式"/>
                </el-form-item>
                <el-form-item label="节点命名">
                  <el-input v-model="form.rename" placeholder="例如：a@b``1@2"/>
                </el-form-item>
                <el-form-item label="远程设备">
                  <el-input v-model="form.devid" placeholder="Quantumult X 远程设备 ID"/>
                </el-form-item>
                <el-form-item label="更新间隔">
                  <el-input v-model="form.interval" placeholder="单位：天"/>
                </el-form-item>
              </div>

              <div class="option-grid">
                <el-checkbox v-model="form.nodeList" label="仅输出节点" border></el-checkbox>
                <el-checkbox v-model="form.emoji" label="启用 Emoji" border></el-checkbox>
                <el-checkbox v-model="form.insert" label="插入默认节点" border></el-checkbox>
                <el-checkbox v-model="form.udp" label="启用 UDP" border></el-checkbox>
                <el-checkbox v-model="form.xudp" label="启用 XUDP" border></el-checkbox>
                <el-checkbox v-model="form.tfo" label="启用 TFO" border></el-checkbox>
                <el-checkbox v-model="form.sort" label="基础节点排序" border></el-checkbox>
                <el-checkbox v-model="form.appendType" label="插入节点类型" border></el-checkbox>
                <el-checkbox v-model="form.tls13" label="启用 TLS 1.3" border></el-checkbox>
                <el-checkbox v-model="form.expand" label="展开规则全文" border></el-checkbox>
                <el-checkbox v-model="form.new_name" label="Clash 新字段名" border></el-checkbox>
                <el-checkbox v-model="form.scv" label="跳过证书验证" border></el-checkbox>
                <el-checkbox v-model="form.fdn" label="过滤不支持节点" border></el-checkbox>
                <el-checkbox v-model="form.tpl.clash.doh" label="Clash DoH" border></el-checkbox>
                <el-checkbox v-model="form.tpl.surge.doh" label="Surge DoH" border></el-checkbox>
                <el-checkbox v-model="form.tpl.singbox.ipv6" label="Sing-Box IPv6" border></el-checkbox>
              </div>
            </el-collapse-item>
          </el-collapse>

          <div class="action-row">
            <el-button
                class="primary-action"
                type="primary"
                icon="el-icon-link"
                @click="makeUrl"
                :disabled="form.sourceSubUrl.length === 0"
            >生成订阅链接</el-button>
            <el-button
                class="secondary-action"
                icon="el-icon-document-copy"
                @click="dialogLoadConfigVisible = true"
            >解析已有链接</el-button>
          </div>

          <section class="result-section">
            <div class="section-heading">
              <span>转换结果</span>
              <span v-if="customSubUrl" class="result-state">已生成</span>
            </div>
            <el-input
                class="copy-content"
                readonly
                v-model="customSubUrl"
                placeholder="生成后的订阅链接将在这里显示"
            >
              <el-button
                  slot="append"
                  v-clipboard:copy="customSubUrl"
                  v-clipboard:success="onCopy"
                  ref="copy-btn"
                  icon="el-icon-document-copy"
                  :disabled="customSubUrl.length === 0"
              >复制</el-button>
            </el-input>
          </section>
        </el-form>
      </el-card>
    </section>

    <el-dialog
        class="parse-dialog"
        title="解析订阅链接"
        :visible.sync="dialogLoadConfigVisible"
        :fullscreen="!isPC"
        width="640px"
    >
      <el-form label-position="top">
        <el-form-item label="订阅链接" prop="loadConfig">
          <el-input
              v-model="loadConfig"
              type="textarea"
              :autosize="{ minRows: 8, maxRows: 12 }"
              maxlength="5000"
              show-word-limit
              placeholder="粘贴包含 target 和 url 参数的完整订阅链接"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="loadConfig = ''; dialogLoadConfigVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="confirmLoadConfig"
            :disabled="loadConfig.length === 0"
        >解析并填入</el-button>
      </div>
    </el-dialog>
  </main>
</template>
<script>
const defaultBackend = process.env.VUE_APP_SUBCONVERTER_DEFAULT_BACKEND
export default {
  data() {
    return {
      backendVersion: "",
      // 是否为 PC 端
      isPC: true,
      options: {
        clientTypes: {
          Clash: "clash",
          ShadowRocket: "shadowrocket",
          "Surge4/5": "surge&ver=4",
          "Sing-Box": "singbox",
          V2Ray: "v2ray",
          Trojan: "trojan",
          ShadowsocksR: "ssr",
          "混合订阅（mixed）": "mixed",
          Surfboard: "surfboard",
          Quantumult: "quan",
          "Quantumult X": "quanx",
          Loon: "loon",
          Mellow: "mellow",
          Surge3: "surge&ver=3",
          Surge2: "surge&ver=2",
          ClashR: "clashr",
          "Shadowsocks(SIP002)": "ss",
          "Shadowsocks Android(SIP008)": "sssub",
          ShadowsocksD: "ssd",
          "自动判断客户端": "auto",
        },
        customBackend: {
          "默认后端": defaultBackend,
        },
        remoteConfig: [
          {
            label: "通用",
            options: [
              {
                label: "默认",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_NoAuto.ini"
              },
              {
                label: "默认（自动测速）",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_AdblockPlus.ini"
              },
              {
                label: "默认（附带用于 Clash 的 AdGuard DNS）",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/default_with_clash_adg.yml"
              },
              {
                label: "ACL_全分组 Dream修改版",
                value: "https://raw.githubusercontent.com/WC-Dream/ACL4SSR/WD/Clash/config/ACL4SSR_Online_Full_Dream.ini"
              },
              {
                label: "ACL_精简分组 Dream修改版",
                value: "https://raw.githubusercontent.com/WC-Dream/ACL4SSR/WD/Clash/config/ACL4SSR_Mini_Dream.ini"
              },
              {
                label: "emby-TikTok-流媒体分组-去广告加强版",
                value: "https://raw.githubusercontent.com/justdoiting/ClashRule/main/GeneralClashRule.ini"
              },
              {
                label: "流媒体通用分组",
                value: "https://raw.githubusercontent.com/cutethotw/ClashRule/main/GeneralClashRule.ini"
              }
            ]
          },
          {
            label: "ACL规则",
            options: [
              {
                label: "ACL_默认版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini"
              },
              {
                label: "ACL_无测速版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_NoAuto.ini"
              },
              {
                label: "ACL_去广告版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_AdblockPlus.ini"
              },
              {
                label: "ACL_多国家版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_MultiCountry.ini"
              },
              {
                label: "ACL_无Reject版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_NoReject.ini"
              },
              {
                label: "ACL_无测速精简版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_NoAuto.ini"
              },
              {
                label: "ACL_全分组版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini"
              },
              {
                label: "ACL_全分组谷歌版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Google.ini"
              },
              {
                label: "ACL_全分组多模式版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_MultiMode.ini"
              },
              {
                label: "ACL_全分组奈飞版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Netflix.ini"
              },
              {
                label: "ACL_精简版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini.ini"
              },
              {
                label: "ACL_去广告精简版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_AdblockPlus.ini"
              },
              {
                label: "ACL_Fallback精简版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_Fallback.ini"
              },
              {
                label: "ACL_多国家精简版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiCountry.ini"
              },
              {
                label: "ACL_多模式精简版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiMode.ini"
              }
            ]
          },
          {
            label: "全网搜集规则",
            options: [
              {
                label: "常规规则",
                value: "https://raw.githubusercontent.com/flyhigherpi/merlinclash_clash_related/master/Rule_config/ZHANG.ini"
              },
              {
                label: "酷酷自用",
                value: "https://raw.githubusercontent.com/xiaoshenxian233/cool/rule/complex.ini"
              },
              {
                label: "PharosPro无测速",
                value:
                    "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/special/phaors.ini"
              },
              {
                label: "分区域故障转移",
                value: "https://raw.githubusercontent.com/flyhigherpi/merlinclash_clash_related/master/Rule_config/ZHANG_Area_Fallback.ini"
              },
              {
                label: "分区域自动测速",
                value: "https://raw.githubusercontent.com/flyhigherpi/merlinclash_clash_related/master/Rule_config/ZHANG_Area_Urltest.ini"
              },
              {
                label: "分区域无自动测速",
                value: "https://raw.githubusercontent.com/flyhigherpi/merlinclash_clash_related/master/Rule_config/ZHANG_Area_NoAuto.ini"
              },
              {
                label: "OoHHHHHHH",
                value: "https://raw.githubusercontent.com/OoHHHHHHH/ini/master/config.ini"
              },
              {
                label: "CFW-TAP",
                value: "https://raw.githubusercontent.com/OoHHHHHHH/ini/master/cfw-tap.ini"
              },
              {
                label: "lhl77全分组（定期更新）",
                value: "https://raw.githubusercontent.com/lhl77/sub-ini/main/tsutsu-full.ini"
              },
              {
                label: "lhl77简易版（定期更新）",
                value: "https://raw.githubusercontent.com/lhl77/sub-ini/main/tsutsu-mini-gfw.ini"
              },
              {
                label: "ConnersHua 神机规则 Outbound",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/connershua_new.ini"
              },
              {
                label: "ConnersHua 神机规则 Inbound 回国专用",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/connershua_backtocn.ini"
              },
              {
                label: "lhie1 洞主规则（使用 Clash 分组规则）",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/lhie1_clash.ini"
              },
              {
                label: "lhie1 洞主规则完整版",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/lhie1_dler.ini"
              },
              {
                label: "eHpo1 规则",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/ehpo1_main.ini"
              },
              {
                label: "多策略组默认白名单模式",
                value: "https://raw.nameless13.com/api/public/dl/ROzQqi2S/white.ini"
              },
              {
                label: "多策略组可以有效减少审计触发",
                value: "https://raw.nameless13.com/api/public/dl/ptLeiO3S/mayinggfw.ini"
              },
              {
                label: "精简策略默认白名单",
                value: "https://raw.nameless13.com/api/public/dl/FWSh3dXz/easy3.ini"
              },
              {
                label: "多策略增加SMTP策略",
                value: "https://raw.nameless13.com/api/public/dl/L_-vxO7I/youtube.ini"
              },
              {
                label: "无策略入门推荐",
                value: "https://raw.nameless13.com/api/public/dl/zKF9vFbb/easy.ini"
              },
              {
                label: "无策略入门推荐国家分组",
                value: "https://raw.nameless13.com/api/public/dl/E69bzCaE/easy2.ini"
              },
              {
                label: "无策略仅IPIP CN + Final",
                value: "https://raw.nameless13.com/api/public/dl/XHr0miMg/ipip.ini"
              },
              {
                label: "无策略魅影vip分组",
                value: "https://raw.nameless13.com/api/public/dl/BBnfb5lD/MAYINGVIP.ini"
              },
              {
                label: "品云专属配置（仅香港区域分组）",
                value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/Examine.ini"
              },
              {
                label: "品云专属配置（全地域分组）",
                value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/Examine_Full.ini"
              },
              {
                label: "nzw9314 规则",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/nzw9314_custom.ini"
              },
              {
                label: "maicoo-l 规则",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/maicoo-l_custom.ini"
              },
              {
                label: "DlerCloud Platinum 李哥定制规则",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/dlercloud_lige_platinum.ini"
              },
              {
                label: "DlerCloud Gold 李哥定制规则",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/dlercloud_lige_gold.ini"
              },
              {
                label: "DlerCloud Silver 李哥定制规则",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/dlercloud_lige_silver.ini"
              },
              {
                label: "ProxyStorage自用",
                value: "https://unpkg.com/proxy-script/config/Clash/clash.ini"
              },
              {
                label: "ShellClash修改版规则 (by UlinoyaPed)",
                value: "https://github.com/UlinoyaPed/ShellClash/raw/master/rules/ShellClash.ini"
              }
            ]
          },
          {
            label: "各大机场规则",
            options: [
              {
                label: "EXFLUX",
                value:
                    "https://gist.github.com/jklolixxs/16964c46bad1821c70fa97109fd6faa2/raw/EXFLUX.ini"
              },
              {
                label: "NaNoport",
                value:
                    "https://gist.github.com/jklolixxs/32d4e9a1a5d18a92beccf3be434f7966/raw/NaNoport.ini"
              },
              {
                label: "CordCloud",
                value:
                    "https://gist.github.com/jklolixxs/dfbe0cf71ffc547557395c772836d9a8/raw/CordCloud.ini"
              },
              {
                label: "BigAirport",
                value:
                    "https://gist.github.com/jklolixxs/e2b0105c8be6023f3941816509a4c453/raw/BigAirport.ini"
              },
              {
                label: "跑路云",
                value:
                    "https://gist.github.com/jklolixxs/9f6989137a2cfcc138c6da4bd4e4cbfc/raw/PaoLuCloud.ini"
              },
              {
                label: "WaveCloud",
                value:
                    "https://gist.github.com/jklolixxs/fccb74b6c0018b3ad7b9ed6d327035b3/raw/WaveCloud.ini"
              },
              {
                label: "几鸡",
                value:
                    "https://gist.github.com/jklolixxs/bfd5061dceeef85e84401482f5c92e42/raw/JiJi.ini"
              },
              {
                label: "四季加速",
                value:
                    "https://gist.github.com/jklolixxs/6ff6e7658033e9b535e24ade072cf374/raw/SJ.ini"
              },
              {
                label: "ImmTelecom",
                value:
                    "https://gist.github.com/jklolixxs/24f4f58bb646ee2c625803eb916fe36d/raw/ImmTelecom.ini"
              },
              {
                label: "AmyTelecom",
                value:
                    "https://gist.github.com/jklolixxs/b53d315cd1cede23af83322c26ce34ec/raw/AmyTelecom.ini"
              },
              {
                label: "LinkCube",
                value:
                    "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/customized/convenience.ini"
              },
              {
                label: "Miaona",
                value:
                    "https://gist.github.com/jklolixxs/ff8ddbf2526cafa568d064006a7008e7/raw/Miaona.ini"
              },
              {
                label: "Foo&Friends",
                value:
                    "https://gist.github.com/jklolixxs/df8fda1aa225db44e70c8ac0978a3da4/raw/Foo&Friends.ini"
              },
              {
                label: "ABCloud",
                value:
                    "https://gist.github.com/jklolixxs/b1f91606165b1df82e5481b08fd02e00/raw/ABCloud.ini"
              },
              {
                label: "咸鱼",
                value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/xianyu.ini"
              },
              {
                label: "便利店",
                value: "https://subweb.oss-cn-hongkong.aliyuncs.com/RemoteConfig/customized/convenience.ini"
              },
              {
                label: "CNIX",
                value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/SSRcloud.ini"
              },
              {
                label: "Nirvana",
                value: "https://raw.githubusercontent.com/Mazetsz/ACL4SSR/master/Clash/config/V2rayPro.ini"
              },
              {
                label: "V2Pro",
                value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/V2Pro.ini"
              },
              {
                label: "史迪仔-自动测速",
                value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/Stitch.ini"
              },
              {
                label: "史迪仔-负载均衡",
                value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/Stitch-Balance.ini"
              },
              {
                label: "Maying",
                value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/maying.ini"
              },
              {
                label: "Ytoo",
                value: "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/customized/ytoo.ini"
              },
              {
                label: "w8ves",
                value: "https://raw.nameless13.com/api/public/dl/M-We_Fn7/w8ves.ini"
              },
              {
                label: "NyanCAT",
                value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/nyancat.ini"
              },
              {
                label: "Nexitally",
                value: "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/customized/nexitally.ini"
              },
              {
                label: "SoCloud",
                value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/socloud.ini"
              },
              {
                label: "ARK",
                value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/ark.ini"
              },
              {
                label: "N3RO",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/n3ro_optimized.ini"
              },
              {
                label: "Scholar",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/scholar_optimized.ini"
              },
              {
                label: "Flowercloud",
                value: "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/customized/flower.ini"
              }
            ]
          },
          {
            label: "特殊",
            options: [
              {
                label: "NeteaseUnblock",
                value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/special/netease.ini"
              },
              {
                label: "Basic",
                value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/special/basic.ini"
              }
            ]
          }
        ]
      },
      form: {
        sourceSubUrl: "",
        clientType: "",
        customBackend: this.getUrlParam() == "" ? defaultBackend : this.getUrlParam(),
        remoteConfig: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_NoAuto.ini",
        excludeRemarks: "",
        includeRemarks: "",
        filename: "",
        rename: "",
        devid: "",
        interval: "",
        diyua: "ShadowRocket",
        emoji: true,
        nodeList: false,
        tls13: false,
        udp: false,
        xudp: false,
        tfo: false,
        sort: false,
        expand: true,
        scv: false,
        fdn: false,
        appendType: false,
        insert: false, // 是否插入默认订阅的节点，对应配置项 insert_url
        new_name: true, // 是否使用 Clash 新字段
        tpl: {
          surge: {
            doh: false // dns 查询是否使用 DoH
          },
          clash: {
            doh: false
          },
          singbox: {
            ipv6: false
          }
        }
      },
      customSubUrl: "",
      loadConfig: "",
      dialogLoadConfigVisible: false
    };
  },
  created() {
    document.title = "在线订阅转换工具";
    this.isPC = this.$getOS().isPc;
  },
  mounted() {
    this.form.clientType = "clash";
    this.getBackendVersion();
    this.anhei();
    let lightMedia = window.matchMedia('(prefers-color-scheme: light)');
    let darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    let callback = (e) => {
      if (e.matches) {
        this.anhei();
      }
    };
    if (typeof darkMedia.addEventListener === 'function' || typeof lightMedia.addEventListener === 'function') {
      lightMedia.addEventListener('change', callback);
      darkMedia.addEventListener('change', callback);
    } //监听系统主题，自动切换！
  },
  methods: {
    selectChanged() {
      this.getBackendVersion();
    },
    getUrlParam() {
      let query = window.location.search.substring(1);
      let vars = query.split('&');
      for (let i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] == "backend") {
          return decodeURIComponent(pair[1]);
        }
      }
      return "";
    },
    anhei() {
      const getLocalTheme = window.localStorage.getItem("localTheme");
      const lightMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
      const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      if (getLocalTheme) {
        document.getElementsByTagName('body')[0].className = getLocalTheme;
      } //读取localstorage，优先级最高！
      else if (getLocalTheme == null || getLocalTheme == "undefined" || getLocalTheme == "") {
        if (new Date().getHours() >= 19 || new Date().getHours() < 7) {
          document.getElementsByTagName('body')[0].setAttribute('class', 'dark-mode');
        } else {
          document.getElementsByTagName('body')[0].setAttribute('class', 'light-mode');
        } //根据当前时间来判断，用来对付QQ等不支持媒体变量查询的浏览器
        if (lightMode && lightMode.matches) {
          document.getElementsByTagName('body')[0].setAttribute('class', 'light-mode');
        }
        if (darkMode && darkMode.matches) {
          document.getElementsByTagName('body')[0].setAttribute('class', 'dark-mode');
        } //根据窗口主题来判断当前主题！
      }
    },
    change() {
      var zhuti = document.getElementsByTagName('body')[0].className;
      if (zhuti === 'light-mode') {
        document.getElementsByTagName('body')[0].setAttribute('class', 'dark-mode');
        window.localStorage.setItem('localTheme', 'dark-mode');
      }
      if (zhuti === 'dark-mode') {
        document.getElementsByTagName('body')[0].setAttribute('class', 'light-mode');
        window.localStorage.setItem('localTheme', 'light-mode');
      }
    },
    onCopy() {
      this.$message.success("已复制");
    },
    makeUrl() {
      if (this.form.sourceSubUrl === "" || this.form.clientType === "") {
        this.$message.error("订阅链接与客户端为必填项");
        return false;
      }
      let backend =
          this.form.customBackend === ""
              ? defaultBackend
              : this.form.customBackend;
      let sourceSub = this.form.sourceSubUrl;
      sourceSub = sourceSub.replace(/(\n|\r|\n\r)/g, "|");
      this.customSubUrl =
          backend +
          "/sub?target=" +
          this.form.clientType +
          "&url=" +
          encodeURIComponent(sourceSub) +
          "&insert=" +
          this.form.insert;
      if (this.form.remoteConfig !== "") {
        this.customSubUrl +=
            "&config=" + encodeURIComponent(this.form.remoteConfig);
      }
      if (this.form.excludeRemarks !== "") {
        this.customSubUrl +=
            "&exclude=" + encodeURIComponent(this.form.excludeRemarks);
      }
      if (this.form.includeRemarks !== "") {
        this.customSubUrl +=
            "&include=" + encodeURIComponent(this.form.includeRemarks);
      }
      if (this.form.filename !== "") {
        this.customSubUrl +=
            "&filename=" + encodeURIComponent(this.form.filename);
      }
      if (this.form.rename !== "") {
        this.customSubUrl +=
            "&rename=" + encodeURIComponent(this.form.rename);
      }
      if (this.form.interval !== "") {
        this.customSubUrl +=
            "&interval=" + encodeURIComponent(this.form.interval * 86400);
      }
      if (this.form.devid !== "") {
        this.customSubUrl +=
            "&dev_id=" + encodeURIComponent(this.form.devid);
      }
      if (this.form.appendType) {
        this.customSubUrl +=
            "&append_type=" + this.form.appendType.toString();
      }
      if (this.form.tls13) {
        this.customSubUrl +=
            "&tls13=" + this.form.tls13.toString();
      }
      if (this.form.sort) {
        this.customSubUrl +=
            "&sort=" + this.form.sort.toString();
      }
      this.customSubUrl +=
          "&emoji=" +
          this.form.emoji.toString() +
          "&list=" +
          this.form.nodeList.toString() +
          "&xudp=" +
          this.form.xudp.toString() +
          "&udp=" +
          this.form.udp.toString() +
          "&tfo=" +
          this.form.tfo.toString() +
          "&expand=" +
          this.form.expand.toString() +
          "&scv=" +
          this.form.scv.toString() +
          "&fdn=" +
          this.form.fdn.toString();    
      if (this.form.clientType.includes("surge")) {
        if (this.form.tpl.surge.doh === true) {
          this.customSubUrl += "&surge.doh=true";
        }
      }
      if (this.form.clientType === "clash") {
        if (this.form.tpl.clash.doh === true) {
          this.customSubUrl += "&clash.doh=true";
        }
        this.customSubUrl += "&new_name=" + this.form.new_name.toString();
      }
      if (this.form.clientType === "singbox") {
        if (this.form.tpl.singbox.ipv6 === true) {
          this.customSubUrl += "&singbox.ipv6=1";
        }
      }
      if (this.form.diyua.trim() !== "") {
        this.customSubUrl +=
            "&diyua=" + encodeURIComponent(this.form.diyua);
      }
      this.$copyText(this.customSubUrl);
      this.$message.success("定制订阅已复制到剪贴板");
    },
    confirmLoadConfig() {
      let url;
      try {
        url = new URL(this.loadConfig.trim());
      } catch (error) {
        this.$message.error("请输入正确的订阅地址!");
        return;
      }
      if (!["http:", "https:"].includes(url.protocol) ||
          !url.searchParams.get("target") || !url.searchParams.get("url")) {
        this.$message.error("请输入包含 target 和 url 参数的完整订阅链接!");
        return;
      }
      this.form.customBackend = url.origin;
      const param = url.searchParams;
      const target = param.get("target");
      if (target === 'surge') {
        this.form.clientType = target + "&ver=" + (param.get("ver") || "4");
      } else {
        this.form.clientType = target;
      }
      this.form.sourceSubUrl = param.get("url");
      if (param.get("insert")) {
        this.form.insert = param.get("insert") === 'true';
      }
      if (param.get("config")) {
        this.form.remoteConfig = param.get("config");
      }
      if (param.get("exclude")) {
        this.form.excludeRemarks = param.get("exclude");
      }
      if (param.get("include")) {
        this.form.includeRemarks = param.get("include");
      }
      if (param.get("filename")) {
        this.form.filename = param.get("filename");
      }
      if (param.get("rename")) {
        this.form.rename = param.get("rename");
      }
      if (param.get("interval")) {
        this.form.interval = Math.ceil(param.get("interval") / 86400);
      }
      if (param.get("dev_id")) {
        this.form.devid = param.get("dev_id");
      }
      if (param.get("append_type")) {
        this.form.appendType = param.get("append_type") === 'true';
      }
      if (param.get("tls13")) {
        this.form.tls13 = param.get("tls13");
      }
      if (param.get("xudp")) {
        this.form.xudp = param.get("xudp") === 'true';
      }
      if (param.get("sort")) {
        this.form.sort = param.get("sort") === 'true';
      }
      if (param.get("emoji")) {
        this.form.emoji = param.get("emoji") === 'true';
      }
      if (param.get("list")) {
        this.form.nodeList = param.get("list") === 'true';
      }
      if (param.get("udp")) {
        this.form.udp = param.get("udp") === 'true';
      }
      if (param.get("tfo")) {
        this.form.tfo = param.get("tfo") === 'true';
      }
      if (param.get("expand")) {
        this.form.expand = param.get("expand") === 'true';
      }
      if (param.get("scv")) {
        this.form.scv = param.get("scv") === 'true';
      }
      if (param.get("fdn")) {
        this.form.fdn = param.get("fdn") === 'true';
      }
      if (param.get("surge.doh")) {
        this.form.tpl.surge.doh = param.get("surge.doh") === 'true';
      }
      if (param.get("clash.doh")) {
        this.form.tpl.clash.doh = param.get("clash.doh") === 'true';
      }
      if (param.get("new_name")) {
        this.form.new_name = param.get("new_name") === 'true';
      }
      if (param.get("singbox.ipv6")) {
        this.form.tpl.singbox.ipv6 = param.get("singbox.ipv6") === '1';
      }
      if (param.get("diyua")) {
        this.form.diyua = param.get("diyua");
      }
      this.dialogLoadConfigVisible = false;
      this.$message.success("订阅链接已成功解析为订阅信息");
    },
    getBackendVersion() {
      this.$axios
          .get(
              this.form.customBackend + "/version"
          )
          .then(res => {
            this.backendVersion = res.data.replace(/backend\n$/gm, "");
            this.backendVersion = this.backendVersion.replace("subconverter", "SubConverter");
          })
          .catch(() => {
            this.$message.error("请求SubConverter版本号返回数据失败，该后端不可用！");
          });
    }
  }
};
</script>






