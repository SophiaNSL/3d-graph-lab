var default_uuid = "6b5b5d6a-158c-11e7-803e-0242ac110017"

post_data = {
  'query': '{ { metadata (uuid: \"' + default_uuid + '\") { edges { node { name } } } }',
}

request_options = {
  'method': 'POST',
  'headers': {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  'mode': 'cors',
  'referrer': 'no-referrer',
  'body': JSON.stringify(post_data)
}


fetch('https://registry.aristotlemetadata.com/api/graphql/', request_options).then(
  function(response) {
    console.log(response.status)
    console.log(status)
  }
);
