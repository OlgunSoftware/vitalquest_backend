const { GoogleGenerativeAI } = require('@google/generative-ai');

// Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Kullanıcıya özel görevler oluştur
const generateTasks = async (req, res) => {
  try {
    const { name, surname, age, job } = req.body;

    // Validation
    if (!name || !job) {
      return res.status(400).json({
        success: false,
        message: 'İsim ve meslek gereklidir!'
      });
    }

    // Meslek boş veya geçersizse default görevler döndür
    const userJob = job?.trim();
    if (!userJob || userJob === 'belirtilmemiş') {
      const defaultTasks = [
        {
          title: '♻️ Geri Dönüşüm',
          description: 'Plastik şişeleri geri dönüşüme at',
          xpReward: 150,
          category: 'recycling'
        },
        {
          title: '💧 Su Tasarrufu',
          description: 'Duş süresini 5 dakika kısalt',
          xpReward: 100,
          category: 'water'
        },
        {
          title: '🚴 Aktif Ulaşım',
          description: 'Kısa mesafelerde yürüyerek git',
          xpReward: 120,
          category: 'transport'
        },
        {
          title: '💡 Enerji Tasarrufu',
          description: 'Kullanılmayan cihazları kapat',
          xpReward: 100,
          category: 'energy'
        },
        {
          title: '🌱 Yerel Ürünler',
          description: 'Yerel pazardan alışveriş yap',
          xpReward: 130,
          category: 'food'
        },
        {
          title: '📚 Bilgi Paylaşımı',
          description: 'Çevre bilincini arkadaşınla paylaş',
          xpReward: 110,
          category: 'education'
        }
      ];

      return res.status(200).json({
        success: true,
        data: { tasks: defaultTasks }
      });
    }

    // Gemini AI ile görevler oluştur
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
Sen bir çevre ve sürdürülebilirlik uzmanısın. Kullanıcının mesleğine göre dünyayı daha iyi bir yer yapacak günlük görevler oluştur.

KULLANICI BİLGİLERİ:
- İsim: ${name} ${surname || ''}
- Yaş: ${age || 'belirtilmemiş'}
- Meslek: ${userJob}

ÖNEMLİ KURALLAR:
1. Görevler MUTLAKA "${userJob}" mesleğiyle DOĞRUDAN İLGİLİ olmalı
2. Her görev gerçekçi, yapılabilir ve günlük hayatta uygulanabilir olmalı
3. Görevler çevre dostu, sürdürülebilir ve topluma faydalı olmalı
4. Başlıklar kısa ve anlaşılır olmalı (maksimum 20 karakter)
5. Açıklamalar net ve anlaşılır olmalı (maksimum 40 karakter)
6. XP ödülleri 100-200 arası olmalı (zorluk seviyesine göre)
7. Kategoriler: recycling, water, transport, energy, food, education

ZORUNLU JSON FORMATI (düz metin, kod bloğu yok):
[
  {
    "title": "emoji + kısa başlık",
    "description": "net açıklama",
    "xpReward": 150,
    "category": "kategori"
  }
]

TAM 6 GÖREV OLUŞTUR. Sadece JSON array döndür, başka açıklama ekleme.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // JSON temizleme
    text = text.trim();
    text = text.replace(/```json\n?/g, '');
    text = text.replace(/```\n?/g, '');
    text = text.trim();

    // JSON parse
    let tasks;
    try {
      tasks = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError);
      console.error('Gelen text:', text);
      
      // Parse hatası durumunda default görevler döndür
      const defaultTasks = [
        {
          title: '♻️ Geri Dönüşüm',
          description: 'Plastik şişeleri geri dönüşüme at',
          xpReward: 150,
          category: 'recycling'
        },
        {
          title: '💧 Su Tasarrufu',
          description: 'Duş süresini 5 dakika kısalt',
          xpReward: 100,
          category: 'water'
        },
        {
          title: '🚴 Aktif Ulaşım',
          description: 'Kısa mesafelerde yürüyerek git',
          xpReward: 120,
          category: 'transport'
        },
        {
          title: '💡 Enerji Tasarrufu',
          description: 'Kullanılmayan cihazları kapat',
          xpReward: 100,
          category: 'energy'
        },
        {
          title: '🌱 Yerel Ürünler',
          description: 'Yerel pazardan alışveriş yap',
          xpReward: 130,
          category: 'food'
        },
        {
          title: '📚 Bilgi Paylaşımı',
          description: 'Çevre bilincini arkadaşınla paylaş',
          xpReward: 110,
          category: 'education'
        }
      ];

      return res.status(200).json({
        success: true,
        data: { tasks: defaultTasks }
      });
    }

    // Validation
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz görev formatı!'
      });
    }

    res.status(200).json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Gemini generateTasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Görevler oluşturulurken bir hata oluştu!',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  generateTasks
};
