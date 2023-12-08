// import { getRemindersDueInOneWeek } from '../models/CustomerModel';
// import { sendEmail } from './emailService';
// import { Customer } from '../entities/Customer';

// async function sendReminders(customers: Customer[]): Promise<void> {
//   for (const user of customers) {
//     for (const reminder of user.reminders) {
//       const { sendNotificationOn, items } = reminder;

//       const subject = `Reminder for ${sendNotificationOn.toLocaleDateString()}`;
//       let message = 'Reminder Items:\n';

//       for (const item of items) {
//         message += `   - ${item}\n`;
//       }

//       await sendEmail(user.email, subject, message);
//     }
//   }
// }

// async function sendOneWeekReminders(): Promise<void> {
//   const users = await getRemindersDueInOneWeek();
//   await sendReminders(users);
// }

// export { sendOneWeekReminders };
