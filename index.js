tau.mashups
    .addDependency('jQuery')
    .addDependency('react')
    .addDependency('tau/configurator')
    .addMashup(function($, React, configurator) {
        var D = React.DOM;

        var WeatherWidget = React.createClass({
            getInitialState: function() {
                return {
                    isLoaded: false,
                    temp: null,
                    tempText: null,
                    text: null
                };
            },

            getDefaultProps: function() {
                return {
                    location: 'Minsk'
                };
            },

            componentDidMount: function() {
                $.ajax('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22' + this.props.location + '%22)and%20u=%27c%27&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys')
                .then(function(response) {
                    var query = response.query;
                    console.log(query);
                    if (query.results && query.results.channel && query.results.channel.item) {
                        var item = query.results.channel.item;
                        var condition = item.condition;
                        this.setState({
                            isLoaded: true,
                            temp: condition.temp,
                            tempText: condition.text,
                            text: item.title
                        });
                    }
                }.bind(this));
            },

            render: function() {
                return (
                    D.div({
                        style:{
                            backgroundColor: '#F1EED9',
                            padding: '20px',
                            color: '#2E221F',
                            fontFamily: 'OpenSans',
                            minHeight: '180px',
                            textAlign: 'center',
                            fontSize: '24px'
                        }
                    },
                    this.renderContent()));
            },

            renderContent: function() {
                if (!this.state.isLoaded) {
                    return 'Loading weather for ' + this.props.location + '...';
                }

                return D.div(
                    null,
                    D.div({
                        style: {
                            fontSize: '40px',
                            marginBottom: '20px'
                        }
                    },
                    this.state.temp + '°C'),

                    D.div({
                        style: {
                            fontSize: '32px',
                            marginBottom: '20px'
                        }
                    },
                    this.state.tempText),

                    D.div({
                        style: {
                            fontSize: '24px'
                        }
                    },
                    this.state.text)
                );
            }
        });

        var appConfigurator;
        configurator.getGlobalBus().on('configurator.ready', function(evt, configurator) {
            if (!appConfigurator && configurator._id && configurator._id.match(/board/)) {
                appConfigurator = configurator;
                configurator.getDashboardWidgetTemplateRegistry().addWidgetTemplate({
                    id: 'tp_experimental_weather',
                    name: 'Weather',
                    description: 'Displays weather information',
                    tags: ['Mashups'],
                    insert: function(placeholder, settings) {
                        React.render(React.createElement(WeatherWidget), placeholder);
                    }
                });
            }
        });
    });
