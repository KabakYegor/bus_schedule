import React, { Component } from "react";
import "./App.css";

import "bootstrap/dist/css/bootstrap.css"
import { ButtonToolbar, Button,FormGroup,FormControl, Grid, Row, Col, Panel, Heading,Body,Title  } from "react-bootstrap";

class MyTextArea extends Component {
  constructor(props, context) {
    super(props, context);

	this.handleChange = this.handleChange.bind(this);
	
    this.state = {
      value: ""
    };
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }
  
  render() {
    return (
			
	<FormGroup >
          <FormControl
            type="text"
			value={this.state.value}
            placeholder="Введите номер автобуса"
			onChange={this.handleChange}
          />
		  </FormGroup >
    );
  }
}

class ScheduleDisplay extends Component {
  constructor() {
    super();

    this.state = {
      scheduleData: null,
	  days: 0
    };
  }
  
  componentDidMount() {
    const numberBus = this.props.numberBus;
	const stopID = this.props.stopID;
	
	const URL = "https://api.tfl.gov.uk/line/" + numberBus + "/timetable/" + stopID;
	
	fetch(URL).then(res => res.json()).then(json => {
		  this.setState({ scheduleData: json });
	});
  }
  
	parseTime(time)
	{
		var newTime = time;
		
		if(newTime.length < 2) {
			newTime = '0' + newTime;
		}
		
		return newTime
	}
	
	createSchedule(times) 
	{
		var shedule = [];
		
		for(var i = 0; i < times.length; i++){
		
			var hour = this.parseTime(times[i].hour);			
			
			var minute = this.parseTime(times[i].minute);
			
			if(shedule[times[i].hour] === undefined) {
				shedule[times[i].hour] = hour + ':' + minute + '   ';
			}
			else {
				shedule[times[i].hour] += hour + ':' + minute + '   ';
			}
			
		}
		
		return shedule;
	}
	
    render() {		
		if (!this.state.scheduleData) {
			return <div>Loading...</div>;
		}
		const daysForSchedule = this.state.scheduleData.timetable.routes[0].schedules;
		const timeForShedule = daysForSchedule[this.state.days].knownJourneys;

	
	return(
		<div>
		
		<Panel>
			<Panel.Heading>
				<Panel.Title componentClass="h3">
          Расписание автобуса {this.state.scheduleData.lineId} на {this.props.stopName}
				</Panel.Title>
			</Panel.Heading>

		<select class="form-control" id="FormControlSelect" ref="daysMode" onChange={() => {
				this.setState({ days: this.refs.daysMode.value });
			}}>
		{daysForSchedule.map((days, i) => (
				<option value = {i}>{days.name}</option>
		))}	
		</select>
		
		{this.createSchedule(timeForShedule).map((time, i) => (
				<Panel.Body>{time}</Panel.Body>
		))}	
		</Panel>
		</div>
	);}
}

class StopPointsDisplay extends Component {
  constructor() {
    super();

    this.state = {
      busData: null,
	  isShowSchedule:false,
	  stopID: 0,
	  stopName: "line"
    };
  }
  
  componentDidMount() {
    const numberBus = this.props.numberBus;
	const direction = this.props.direction;
		
	const URL = "https://api.tfl.gov.uk/line/" + numberBus + "/route/sequence/" + direction;
	
	fetch(URL).then(res => res.json()).then(json => {
		  this.setState({ busData: json });
	});
  }
  
  rendStopPoints() {
	 const busData = this.state.busData;
	 const busStopPoints = busData.stopPointSequences[0].stopPoint;
	  
	const wellStyles = { maxWidth: 600, margin: '0 auto 10px' }; 
	
	  return (
      <div>
        <h1>
          Автобус {busData.lineName} следует по маршруту:
        </h1>
		<div className="well" style={wellStyles}>
        {busStopPoints.map((stopPoint, i) => (
				<Button  bsSize="large" block
					key={stopPoint.id}
					onClick={() => {
						this.setState({ isShowSchedule: true,
										stopID: stopPoint.id,
										stopName: stopPoint.name});
					}}
				>
					{stopPoint.name}
			  </Button>
		))}	
		</div>
      </div>
    );
  }
  
  rendSchedule() {  
	  const busData = this.state.busData;
	  
	  return (
      <div>
		<Button
			onClick={() => {
				this.setState({ isShowSchedule: false,
								stopID: 0,
								stopName: "line"});
			}}
		>
			Вернуться к линии маршрута автобуса
		</Button>
	    
        <ScheduleDisplay key={this.state.stopID} stopID = {this.state.stopID} numberBus = {busData.lineId} stopName = {this.state.stopName}/>	
      </div>
    );
  } 
  
  render() {
	  	if (!this.state.busData) {
			return <div>Loading...</div>;
		}  
	  
	  const busData = this.state.busData;
		if(busData.hasOwnProperty("httpStatusCode")) {
			return <div><h2>Введите верный номер автобуса</h2></div>;
		}
		
	if(this.state.isShowSchedule) {
		return this.rendSchedule(); 
	} else {		
		return this.rendStopPoints(); 
	}
  }   
}

class App extends Component {
  constructor() {
    super();
    this.state = {
	  numberBus: 1,
	  direction: "outbound"
    };
  }

  render() {
	
	const wellStyles = { maxWidth: 600, margin: '0 auto 10px' }; 
	  
    return (
      <div className="App">
	  
	  <Grid>
          <Row>
            <Col md={4} sm={4}>
			
		<MyTextArea ref = "newTxt"> </MyTextArea>
		
		<div className="well" style={wellStyles}>
		<Button bsStyle="primary" block
		onClick={() => {
			this.setState({ numberBus: this.refs.newTxt.state.value});
        }}
		>
			Изменить номер автобуса
        </Button>
	  
        <Button block	onClick={() => {
			if(this.state.direction === "outbound") {
				this.setState({ direction: "inbound" });
			}
			else {
				this.setState({ direction: "outbound" });
			}
        }}
		>
			Изменить направление маршрута
        </Button>
		</div>
		
			</Col>
            <Col md={8} sm={8}>
			
        <StopPointsDisplay key={this.state.direction + this.state.numberBus} direction={this.state.direction} numberBus = {this.state.numberBus} />
		
			</Col>
          </Row>
        </Grid>
		
      </div>
    );
  }
}

export default App;
