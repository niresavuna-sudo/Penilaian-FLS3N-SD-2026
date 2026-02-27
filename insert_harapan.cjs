const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = "const PengaturanView = ({";
const insertIndex = content.indexOf(targetStr);

if (insertIndex === -1) {
  console.error("Could not find PengaturanView");
  process.exit(1);
}

const juaraViewStart = content.indexOf("const SertifikatJuaraView = ({");
const juaraViewEnd = insertIndex;

let juaraViewCode = content.substring(juaraViewStart, juaraViewEnd);

// Replace SertifikatJuaraView with SertifikatHarapanView
let harapanViewCode = juaraViewCode.replace(/SertifikatJuaraView/g, "SertifikatHarapanView");

// Replace top3 with top4to6
harapanViewCode = harapanViewCode.replace(/const top3 = categoryPeserta\.slice\(0, 3\)\.filter\(p => p\.totalScore > 0\);/g, "const top4to6 = categoryPeserta.slice(3, 6).filter(p => p.totalScore > 0);");

// Replace top3.flatMap with top4to6.flatMap
harapanViewCode = harapanViewCode.replace(/return top3\.flatMap\(\(p, index\) => \{/g, "return top4to6.flatMap((p, index) => {");

// Replace const rank = index + 1; with const rank = index + 4;
harapanViewCode = harapanViewCode.replace(/const rank = index \+ 1;/g, "const rank = index + 4;");

// Replace rankRoman logic
harapanViewCode = harapanViewCode.replace(/const rankRoman = p\.rank === 1 \? 'I' : p\.rank === 2 \? 'II' : p\.rank === 3 \? 'III' : p\.rank;/g, "const rankRoman = p.rank === 4 ? 'Harapan I' : p.rank === 5 ? 'Harapan II' : p.rank === 6 ? 'Harapan III' : p.rank;");

// Replace "Daftar Juara" with "Daftar Harapan"
harapanViewCode = harapanViewCode.replace(/Daftar Juara/g, "Daftar Harapan");

// Replace "peringkat 1, 2, dan 3" with "peringkat 4, 5, dan 6"
harapanViewCode = harapanViewCode.replace(/peringkat 1, 2, dan 3/g, "peringkat 4, 5, dan 6");

// Replace "data juara" with "data harapan"
harapanViewCode = harapanViewCode.replace(/data juara/g, "data harapan");

// Replace "Sertifikat_Juara_" with "Sertifikat_Harapan_"
harapanViewCode = harapanViewCode.replace(/Sertifikat_Juara_/g, "Sertifikat_Harapan_");
harapanViewCode = harapanViewCode.replace(/Daftar_Juara_/g, "Daftar_Harapan_");

// Replace "Juara {p.rank}" with "Harapan {p.rank - 3}"
harapanViewCode = harapanViewCode.replace(/Juara \{p\.rank\}/g, "Harapan {p.rank - 3}");

// Replace bg colors for rank
harapanViewCode = harapanViewCode.replace(/p\.rank === 1 \? 'bg-amber-100 text-amber-700' :/g, "p.rank === 4 ? 'bg-amber-100 text-amber-700' :");
harapanViewCode = harapanViewCode.replace(/p\.rank === 2 \? 'bg-slate-200 text-slate-700' :/g, "p.rank === 5 ? 'bg-slate-200 text-slate-700' :");

const newContent = content.substring(0, insertIndex) + harapanViewCode + content.substring(insertIndex);

fs.writeFileSync('src/App.tsx', newContent);
console.log("Successfully inserted SertifikatHarapanView");
