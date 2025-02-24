export const fetchfixtures = async () => {

    var myHeaders = new Headers();
    myHeaders.append("x-rapidapi-key", "555063298238c542c0c08905f9b89b38");
    myHeaders.append("x-rapidapi-host", "v3.football.api-sports.io");
    
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    
    fetch("https://v3.football.api-sports.io/leagues", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
    
};

 