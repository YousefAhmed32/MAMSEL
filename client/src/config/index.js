
  export const registerFormControls = [
    {
      name: "userName",
      label: "اسم المستخدم",
      placeholder: "أدخل اسم المستخدم",
      componentType: "input",
      type: "text",
    },
    {
      name: "email",
      label: "البريد الإلكتروني",
      placeholder: "أدخل بريدك الإلكتروني",
      componentType: "input",
      type: "email",
    },
    {
      name: "password",
      label: "كلمة المرور",
      placeholder: "أدخل كلمة المرور",
      componentType: "input",
      type: "password",
    },
  ];
  export const loginFormControls = [
    {
      name: "email",
      label: "Email",
      placeholder: "Enter your email",
      componentType: "input",
      type: "email",
    },
    {
      name: "password",
      label: "Password",
      placeholder: "Enter your password",
      componentType: "input",
      type: "password",
    },
  ];

  export const addProductFormElements = [
    {
      label:"اسم المنتج",
      name: "title",
      componentType: "input",
      type: "text",
      placeholder: "أدخل اسم المنتج",
      required: true,
    },
    {
      label: "وصف المنتج",
      name: "description",
      componentType: "textarea",
      placeholder: "أدخل وصف مفصل للمنتج",
      required: true,
    },
    {
      label:"الفئة",
      name:"category",
      componentType: "dynamic-select",
      required: true,
      options: [
        { id: "men", label: "رجالي" },
        { id: "women", label: "نسائي" },
        { id: "kids", label: "أطفال" },
        { id: "accessories", label: "إكسسوارات" },
        { id: "footwear", label: "أحذية" },
        { id: "perfumes", label: "عطور" },
        { id: "oud", label: "عود" },
        { id: "cosmetics", label: "مستحضرات تجميل" },
        { id: "skincare", label: "العناية بالبشرة" },
      ]
    },
    {
      label: "العلامة التجارية",
      name: "brand",
      componentType: "brand-select",
      required: true,
    },
    {
      label: "السعر الأساسي",
      name: "price",
      componentType: "input",
      type: "number",
      placeholder: "أدخل السعر الأساسي",
      required: true,
      min: 0,
    },
    {
      label: "سعر التخفيض (اختياري)",
      name: "salePrice",
      componentType: "input",
      type: "number",
      placeholder: "أدخل سعر التخفيض",
      min: 0,
    },
    {
      label: "الكمية المتاحة",
      name: "totalStock",
      componentType: "input",
      type: "number",
      placeholder: "أدخل الكمية المتاحة",
      required: true,
      min: 0,
    },
    {
      label: "حجم المنتج (مل)",
      name: "size",
      componentType: "input",
      type: "text",
      placeholder: "مثال: 100ml, 50ml",
    },
    {
      label: "نوع الرائحة",
      name: "fragranceType",
      componentType: "select",
      options: [
        { id: "woody", label: "خشبي" },
        { id: "floral", label: "زهري" },
        { id: "citrus", label: "حمضي" },
        { id: "oriental", label: "شرقي" },
        { id: "fresh", label: "منعش" },
        { id: "spicy", label: "حار" },
        { id: "aquatic", label: "مائي" },
        { id: "gourmand", label: "حلو" },
      ],
    },
    {
      label: "الجنس المستهدف",
      name: "gender",
      componentType: "select",
      required: true,
      options: [
        { id: "men", label: "رجالي" },
        { id: "women", label: "نسائي" },
        { id: "unisex", label: "للجنسين" },
      ],
    },
  ]

  export const shoppingViewHeaderMenuItem = [
    {
      id : 'home',
      label:'Home',
      path : '/shop/home'
    },
    {
      id : 'products',
      label:'Mamsel couture',
      path : '/shop/listing'
    },
    {
      id : 'corset',
      label:'Corset',
      path : '/shop/collection/corset'
    },
    {
      id : 'ramadan',
      label:'Ramadan Collection',
      path : '/shop/collection/ramadan'
    },
    {
      id : 'giveaways',
      label:'Giveaways',
      path : '/shop/collection/giveaways'
    },
    {
      id : 'search',
      label:'search',
      path : '/shop/search'
    },
  ]

    export const categoryOptionsMap = {
  men: "Men",
  women: "Women",
  kids: "Kids",
  accessories: "Accessories",
  footwear: "Footwear",
};

export const brandOptionsMap = {
  nike: "Nike",
  adidas: "Adidas",
  puma: "Puma",
  levi: "Levi's",
  zara: "Zara",
  "h&m": "H&M",
};


  export const filterOptions ={
    category:[
        { id: "men", label: "Men" },
        { id: "women", label: "Women" },
        { id: "kids", label: "Kids" },
        { id: "accessories", label: "Accessories" },
        { id: "footwear", label: "Footwear" },
    ],
    brand:[
             { id: "nike", label: "Nike" },
        { id: "adidas", label: "Adidas" },
        { id: "puma", label: "Puma" },
        { id: "levi", label: "Levi's" },
        { id: "zara", label: "Zara" },
        { id: "h&m", label: "H&M" },
    ]
  }

  export const sortOption= [
  {id: "price-lowtohigh", label: "Price: Low to High"},
  {id: "price-hightolow", label: "Price: High to Low"},
  {id: "title-atoz", label: "Title: A to Z"},
  {id: "title-ztoa", label: "Title: Z to A"},
];



export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];



export const addCouponFormElements = [
  {
    label: "كود الكوبون",
    name: "code",
    componentType: "input",
    type: "text",
    placeholder: "أدخل كود الكوبون",
    required: true,
  },
  {
    label: "نوع الخصم",
    name: "discountType",
    componentType: "select",
    required: true,
    options: [
      { id: "fixed", label: "مبلغ ثابت" },
      { id: "percentage", label: "نسبة مئوية" },
    ],
    placeholder: "اختر نوع الخصم",
  },
  {
    label: "قيمة الخصم",
    name: "discountValue", 
    componentType: "input",
    type: "number",
    placeholder: "أدخل قيمة الخصم",
    required: true,
    min: 0,
  },
  {
    label: "تاريخ الانتهاء",
    name: "expiryDate",
    componentType: "input",
    type: "date",
    required: true,
    placeholder: "اختر تاريخ الانتهاء",
  },
  {
    label: "حد الاستخدام (اختياري)",
    name: "usageLimit",
    componentType: "input",
    type: "number",
    placeholder: "كم مرة يمكن استخدامه؟",
    min: 1,
  }
];

