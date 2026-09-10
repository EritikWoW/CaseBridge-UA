/* Fictional, bilingual examples. No real people's information or AI inference. */
const CaseData = (() => {
  const demos = [
    { id: 'deposit', topic: 'housing', region: 'Львівська', deadline: 'week', statuses: ['idp'], evidence: ['identity', 'messages', 'payment'], initials: '01',
      uk: { title: 'Повернути заставу', subtitle: 'Оренда · Львівська область', detail: 'Листування є. Договору немає.', story: 'Після переїзду з Харкова я орендувала квартиру у Львові. При заселенні сплатила заставу 12 000 грн переказом. Виїхала тиждень тому, але власник не повертає кошти й не пояснює причину. Письмового договору немає. Збереглися листування та банківська квитанція. Хочу підготуватися до консультації цього тижня.' },
      en: { title: 'Recover a rental deposit', subtitle: 'Housing · Lviv region', detail: 'Messages available. No written lease.', story: 'After moving from Kharkiv, I rented a flat in Lviv and transferred a UAH 12,000 deposit. I moved out a week ago, but the landlord has not returned the money or explained why. There is no written lease. I have messages and a bank receipt. I want to prepare for a consultation this week.' } },
    { id: 'benefits', topic: 'payments', region: 'Київська', deadline: 'none', statuses: ['idp'], evidence: ['identity', 'contract'], initials: '02',
      uk: { title: 'Розібратися з виплатами', subtitle: 'Статус ВПО · Київська область', detail: 'Виплати зупинили. Причина невідома.', story: 'Я маю довідку ВПО та проживаю в Київській області. Цього місяця виплата не надійшла. Письмового рішення або пояснення я не отримував. Є паспорт та довідка ВПО. Хочу з’ясувати причину та зрозуміти, які питання поставити під час першої консультації.' },
      en: { title: 'Understand a payment pause', subtitle: 'IDP status · Kyiv region', detail: 'Payments paused. No explanation yet.', story: 'I have IDP status and live in Kyiv region. This month my payment did not arrive. I have not received a written decision or explanation. I have my passport and IDP certificate. I want to understand the reason and prepare questions for an initial consultation.' } },
    { id: 'wages', topic: 'work', region: 'Одеська', deadline: 'today', statuses: [], evidence: ['identity', 'contract', 'messages'], initials: '03',
      uk: { title: 'Невиплачена зарплата', subtitle: 'Робота · Одеська область', detail: 'Документи зібрані. Консультація сьогодні.', story: 'Після звільнення мені не виплатили зарплату за останній місяць. Є копія трудового договору, наказ про звільнення та листування з роботодавцем. Потрібно підготувати виклад подій для консультації сьогодні та уточнити, які строки можуть стосуватися моєї ситуації.' },
      en: { title: 'Unpaid final wages', subtitle: 'Employment · Odesa region', detail: 'Documents ready. Consultation today.', story: 'After dismissal I was not paid for my last month of work. I have a copy of my employment contract, dismissal order, and messages with my employer. I need a summary for a consultation today and want to ask which deadlines may apply.' } }
  ];
  const topicNotes = {
    housing: ['Запишіть суму застави, дати оплати й виїзду та відповідь орендодавця. Якщо договору немає — так і зазначте.', 'Note the deposit amount, payment and move-out dates, and the landlord’s response. Say explicitly if there is no lease.'],
    payments: ['Запишіть, яка виплата не надійшла, за який період і чи отримували ви письмове рішення.', 'Note which payment is missing, the period, and whether you received a written decision.'],
    work: ['Складіть коротку хронологію роботи, звільнення й невиплачених сум за вашими записами.', 'Make a short timeline of employment, dismissal, and unpaid amounts according to your records.'],
    documents: ['Перелічіть утрачені документи та копії, які збереглися. Уточніть у юриста порядок відновлення.', 'List lost documents and any remaining copies. Ask a legal adviser about the restoration process.'],
    safety: ['Уточніть, чи безпечно вам зараз. Якщо є безпосередня загроза — позначте її в контексті звернення.', 'Check whether you are safe now. If there is an immediate threat, flag it in the context step.'],
    other: ['Складіть хронологію подій: що сталося, коли і якої допомоги ви очікуєте.', 'Prepare a timeline: what happened, when, and what help you are seeking.']
  };
  const materialKeys = {identity:'identity', messages:'messages', contract:'contract', payment:'paymentProof'};
  function validateIntake(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid intake');
    if (Object.keys(input).some(k => !['situation','topic','danger','region'].includes(k))) throw new Error('Unknown intake field');
    if (typeof input.situation !== 'string' || input.situation.trim().length < 20 || input.situation.length > 1200) throw new Error('Situation must contain 20–1200 characters');
    if (input.topic !== undefined && !Object.hasOwn(topicNotes,input.topic)) throw new Error('Invalid topic');
    if (input.danger !== undefined && typeof input.danger !== 'boolean') throw new Error('Danger must be boolean');
    if (input.region !== undefined && (typeof input.region !== 'string' || input.region.length > 80)) throw new Error('Invalid region');
    return {situation:input.situation.trim(),topic:input.topic || 'other',danger:input.danger ?? false,region:input.region || ''};
  }
  return {demos,topicNotes,materialKeys,validateIntake};
})();
