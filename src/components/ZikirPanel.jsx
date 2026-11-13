/**
 * Panel Inspirasi — satu zikir dipaparkan bagi setiap sesi (pageload),
 * bertukar secara automatik mengikut giliran setiap kali app dibuka.
 * Bilangan sesi disimpan dalam localStorage supaya giliran berterusan.
 */
import { useEffect, useState } from 'react';
import { SparkleIcon } from './icons';

const ZIKIR_LIST = [
  {
    arab: 'أستغفر الله',
    rumi: 'Astaghfirullah',
    makna: 'Aku memohon keampunan Allah',
  },
  {
    arab: 'سبحان الله',
    rumi: 'Subhanallah',
    makna: 'Maha Suci Allah',
  },
  {
    arab: 'الحمد لله',
    rumi: 'Alhamdulillah',
    makna: 'Segala puji bagi Allah',
  },
  {
    arab: 'الله أكبر',
    rumi: 'Allahu Akbar',
    makna: 'Allah Maha Besar',
  },
  {
    arab: 'لا إله إلا الله',
    rumi: 'La ilaha illallah',
    makna: 'Tiada tuhan selain Allah',
  },
  {
    arab: 'سبحان الله وبحمده',
    rumi: 'Subhanallahi wa bihamdih',
    makna: 'Maha Suci Allah dan segala puji bagi-Nya',
  },
  {
    arab: 'لا حول ولا قوة إلا بالله',
    rumi: 'La hawla wa la quwwata illa billah',
    makna: 'Tiada daya kekuatan melainkan dengan Allah',
  },
];

const ZIKIR_KEY = 'notamesyuarat:zikir-count';

export default function ZikirPanel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Giliran bertambah setiap sesi — zikir berbeza setiap kali app dibuka
    const count = Number(localStorage.getItem(ZIKIR_KEY) || '0');
    setIndex(count % ZIKIR_LIST.length);
    localStorage.setItem(ZIKIR_KEY, String(count + 1));
  }, []);

  const zikir = ZIKIR_LIST[index];

  return (
    <div className="panel zikir-panel">
      <div className="zikir-head">
        <h2 className="sidebar-title zikir-title">
          <SparkleIcon size={16} />
          Inspirasi Rohani
        </h2>
      </div>

      <div className="zikir-card">
        <div className="zikir-arch" aria-hidden="true">
          <span className="zikir-lantern lantern-left" />
          <span className="zikir-lantern lantern-right" />
          <p className="zikir-arab" lang="ar" dir="rtl">
            {zikir.arab}
          </p>
        </div>
        <div className="zikir-divider" aria-hidden="true">
          <span>❖</span>
        </div>
        <p className="zikir-rumi">{zikir.rumi}</p>
        <p className="zikir-makna">{zikir.makna}</p>
      </div>
    </div>
  );
}
