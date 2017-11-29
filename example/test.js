const transform = require('./')

const tmp = {
  sku: {
    fr_FR: {
      price: '$.fr_FR.sku.price',
      currency: function currency(data, path, result, key, pointer) {
        result[key] = data[pointer.split('.')[1]].sku.currency
      },
      foo: ['$.some.crazy', {
        bar: '$.example'
      }],
    },
    en_GB: {
      price: '$.en_GB.sku.price',
      currency: '$.en_GB.sku.currency'
    }
  }
}

const data2 = {
  fr_FR: {
    sku: {
      currency: '€',
      price: 1000
    }
  },
  en_GB: {
    sku: {
      currency: '£',
      price: 7000
    }
  },
  some: {
    crazy: [
      {
        example: 'A'
      },
      {
        example: 'B'
      }
    ]
  }
}


var result = transform(data2, tmp);

console.log(JSON.stringify(result, null, 2));