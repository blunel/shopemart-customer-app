# ShopeMart (customer app): Google Play listing

Everything to paste into Play Console for this app. Package: `com.shopemart.app`.

## Store listing

| Field | Value |
|---|---|
| App name (max 30) | ShopeMart |
| Category | Shopping |
| Tags | Shopping, Online shopping, Fashion |
| Contact email | info@shopemart.com.bd |
| Website | https://shopemart.com.bd |
| Privacy policy URL | https://shopemart.com.bd/page/privacy-policy |
| Account deletion URL | https://shopemart.com.bd/delete-account |
| Default language | English (United States); add Bangla (বাংলা) as a second language |

### Short description (max 80)

- EN: `Shop fashion and more at ShopeMart. Fast delivery, cash on delivery.`
- BN: `ShopeMart-এ কিনুন ফ্যাশন ও আরও অনেক কিছু। দ্রুত ডেলিভারি, ক্যাশ অন ডেলিভারি।`

### Full description (max 4000), English

```
ShopeMart brings Bangladesh's best sellers together in one app. Browse thousands of products, pay when your order arrives, and follow it all the way to your door.

WHAT YOU CAN DO
• Browse the latest products, flash sales and featured picks on the home screen
• Search and filter by category, and sort by newest or price
• Pick your colour and size, see what is in stock, and read reviews
• Add to cart and check out in a minute: no account needed
• Pay cash on delivery, or with bKash, Nagad or Rocket where the shop offers it
• Use coupons and loyalty points to save on your order
• Follow every order from placed to delivered, and cancel before it is prepared
• Keep favourites in your wishlist
• Get notified when your order moves

SHOP WITH CONFIDENCE
• Prices are confirmed by the shop at checkout, so what you see is what you pay
• Easy returns and exchanges, as shown on each product page
• Delivery across Bangladesh

CREATE AN ACCOUNT (OPTIONAL)
Sign in to see all your orders in one place and earn points on every order. You can delete your account at any time from Account > Delete account.

Questions? Write to info@shopemart.com.bd or visit shopemart.com.bd.
```

### Full description (max 4000), বাংলা

```
ShopeMart-এ বাংলাদেশের সেরা বিক্রেতাদের হাজারো পণ্য এক অ্যাপে। পণ্য খুঁজুন, অর্ডার হাতে পেয়ে টাকা দিন, আর দরজায় পৌঁছানো পর্যন্ত প্রতিটি ধাপ দেখুন।

যা যা করতে পারবেন
• হোম স্ক্রিনে নতুন পণ্য, ফ্ল্যাশ সেল আর বাছাই করা পণ্য দেখুন
• ক্যাটাগরি অনুযায়ী খুঁজুন, নতুন বা দাম অনুযায়ী সাজান
• রং ও সাইজ বেছে নিন, স্টক দেখুন, রিভিউ পড়ুন
• কার্টে রেখে এক মিনিটে চেকআউট করুন, অ্যাকাউন্ট ছাড়াই
• ক্যাশ অন ডেলিভারি, অথবা দোকান চালু রাখলে বিকাশ, নগদ, রকেটে পেমেন্ট
• কুপন ও পয়েন্ট দিয়ে খরচ কমান
• অর্ডার দেওয়া থেকে ডেলিভারি পর্যন্ত প্রতিটি ধাপ দেখুন; প্রস্তুত হওয়ার আগে বাতিলও করা যায়
• পছন্দের পণ্য উইশলিস্টে রাখুন
• অর্ডারের অবস্থা বদলালে নোটিফিকেশন পান

নিশ্চিন্তে কিনুন
• চেকআউটে দাম দোকান নিজে নিশ্চিত করে, তাই যা দেখেন তাই দেন
• প্রতিটি পণ্যের পাতায় লেখা নিয়মে সহজ রিটার্ন ও এক্সচেঞ্জ
• সারা বাংলাদেশে ডেলিভারি

অ্যাকাউন্ট (ঐচ্ছিক)
সাইন ইন করলে সব অর্ডার এক জায়গায় দেখা যায় এবং প্রতিটি অর্ডারে পয়েন্ট জমে। যেকোনো সময় Account > Delete account থেকে অ্যাকাউন্ট মুছে ফেলতে পারবেন।

প্রশ্ন থাকলে info@shopemart.com.bd-এ লিখুন অথবা shopemart.com.bd দেখুন।
```

### Release notes (first release)

```
First release of the ShopeMart app: browse, order, track and save.
```

## Graphics to upload

| Asset | Size | Source |
|---|---|---|
| App icon | 512 x 512 PNG | `assets/icon.png` (1024 x 1024), downscale |
| Feature graphic | 1024 x 500 PNG | to be designed (logo + "Shop. Pay on delivery.") |
| Phone screenshots | at least 2, 16:9 or 9:16, 320-3840 px | Home, Product, Cart, Checkout, Orders |

## App content declarations

- **Ads:** No.
- **App access:** All features available without login (guest checkout). An account is optional, no special login needed for review.
- **Target audience:** 18 and over.
- **Content rating (IARC questionnaire):** category *Shopping / Reference*. Answer **No** to violence, fear, sexual content, language, controlled substances, gambling; **No** to user-generated content (the app shows reviews but does not let users post them); **No** to sharing location; **No** to digital purchases (it sells physical goods only).
- **News app / COVID / government / financial features:** No. The app only shows what a shopper paid for an order; it does not move money.
- **Permissions used:** `POST_NOTIFICATIONS` (order updates). No camera, location, contacts or storage permission.
- **Account deletion:** In app (Account > Delete account) and on the web (URL above).

## Data safety form

Data is encrypted in transit (HTTPS). Users can ask for deletion (in app and via URL).

| Data type | Collected | Shared | Why | Optional |
|---|---|---|---|---|
| Name | Yes | No | App functionality (delivery), account management | No |
| Phone number | Yes | No | App functionality (delivery contact), account management | No |
| Email address | Yes | No | Account management, order messages | Yes |
| Address | Yes | No | App functionality (delivery) | No |
| Purchase history | Yes | No | App functionality (order history), loyalty points | No |
| Device or other IDs (push token, install id) | Yes | No | App functionality (order notifications), security | No |

Not collected: location, contacts, photos, files, audio, health, calendar, web browsing, app activity, crash logs, advertising ID.

> Owner to confirm: the delivery courier receives the buyer's name, phone and address to deliver the parcel. Google treats data handed to a service provider that acts for the shop as *not shared*, so the table says No. If the courier also uses it for its own purposes, change "Shared" to Yes for Name, Phone and Address.

## Build and release

1. `eas login`, then in this folder `eas init` (creates the Expo project and writes `extra.eas.projectId` into `app.json`; commit it).
2. Push notifications: create a Firebase Android app for `com.shopemart.app`, put `google-services.json` in this folder, add `"googleServicesFile": "./google-services.json"` under `android` in `app.json`, and upload the FCM key in the Expo dashboard. Without it the app still works, only push is off.
3. `eas build --platform android --profile production` builds the `.aab` (target SDK 36 from React Native 0.86).
4. First release must be uploaded by hand: Play Console > Testing > Closed testing > Create release > upload the `.aab`. (The API can only upload after a first manual release.) After that `eas submit` works with a Play service account key.
5. Personal developer account: run a **closed test with at least 12 testers for 14 days**, then apply for production access from the Dashboard.
6. Before the first release: Play App Signing is on by default, keep it on.
