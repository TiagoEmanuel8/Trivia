import React from 'react';
import { connect } from 'react-redux';
import { string, shape, arrayOf, bool, number, func } from 'prop-types';
import { Redirect } from 'react-router';
import actionDecreaseTime from '../../redux/actions/actionDecreaseTime';
import actionResetCounter from '../../redux/actions/actionResetCounter';
import { actionClearClassReducer } from '../../redux/actions/actionClassReducer';
import MultipleAnswers from '../../components/MultipleAnswers';
import BooleanAnswers from '../../components/BooleanAnswers';
import Loading from '../../components/Loading/Loading';
import actionDisableButton from '../../redux/actions/actionDisableButton';
import ShowButton from '../../redux/actions/actionShowButton';
import actionCleanOptionAnswers from '../../redux/actions/actionCleanOptionAnswers';
import Header from '../../components/Header/Header';
import './Game.css';

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      counter: 0,
      redirectFeedback: false,
    };
    this.handleNextQuestion = this.handleNextQuestion.bind(this);
    this.setInLocalStorage = this.setInLocalStorage.bind(this);
  }

  componentDidMount() {
    this.counterTimer();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  setInLocalStorage(playerData) {
    localStorage.setItem('state', JSON.stringify({ player: playerData }));
  }

  // Fazer a verificação, se a questão foi marcada então passe para a próxima.
  handleNextQuestion() {
    const {
      ResetCounter,
      DisableButton,
      StateShowButton,
      cleanOptionAnswers,
      clearClassReducer,
    } = this.props;
    const { counter } = this.state;
    ResetCounter();
    DisableButton(false);
    StateShowButton(false);
    cleanOptionAnswers();
    this.setState((previousState) => ({
      counter: previousState.counter + 1,
    }));

    if (counter >= '4') {
      this.setState({ redirectFeedback: true });
    }
    clearClassReducer();
  }

  counterTimer() {
    const mileseconds = 1000;
    this.interval = setInterval(() => {
      const { time, decreaseTime, stateDisableButton, stateShowButton } = this.props;
      if (time !== 0 || time < 0) {
        decreaseTime();
      } else {
        stateDisableButton(true);
        stateShowButton(true);
      }
    }, mileseconds);
  }

  render() {
    const { player, questions, isFetching, showButton, time } = this.props;
    const { validLogin } = player;
    const { counter, redirectFeedback } = this.state;
    this.setInLocalStorage(player);
    if (!validLogin) return <Redirect exact to="/" />;
    if (isFetching || !questions) {
      return <Loading />;
    }
    if (redirectFeedback) return <Redirect exact to="/feedback" />;
    return (
      <section>
        <Header />
        <main className="main-container">
          <section className="questions-container">
            <p className="time">{ `Tempo: ${time}` }</p>
            <div className="answers">
              { (questions) && questions.map((question) => (
                (question.type === 'multiple')
                  ? <MultipleAnswers question={ question } />
                  : <BooleanAnswers question={ question } />
              ))[counter] }
              {(showButton) && (
                <button
                  type="button"
                  className="next-button"
                  data-testid="btn-next"
                  onClick={ () => this.handleNextQuestion() }
                >
                  Próxima
                </button>
              )}
            </div>
          </section>
        </main>
      </section>
    );
  }
}

const mapStateToProps = ({ playerReducer, questionsReducer }) => ({
  player: playerReducer.player,
  questions: questionsReducer.questions,
  isFetching: questionsReducer.isFetching,
  showButton: questionsReducer.showButtonNextQuestion,
  time: questionsReducer.timer,
});

const mapDispatchToProps = (dispatch) => ({
  ResetCounter: () => dispatch(actionResetCounter()),
  DisableButton: (value) => dispatch(actionDisableButton(value)),
  StateShowButton: (value) => dispatch(ShowButton(value)),
  decreaseTime: () => dispatch(actionDecreaseTime()),
  stateDisableButton: (value) => dispatch(actionDisableButton(value)),
  stateShowButton: (value) => dispatch(ShowButton(value)),
  cleanOptionAnswers: () => dispatch(actionCleanOptionAnswers()),
  clearClassReducer: () => dispatch(actionClearClassReducer()),
});

Game.propTypes = {
  player: shape({
    name: string,
    gravatarEmail: string,
    assertions: string,
    score: string,
  }).isRequired,
  questions: arrayOf(shape()).isRequired,
  time: number.isRequired,
  isFetching: bool.isRequired,
  showButton: bool.isRequired,
  ResetCounter: number.isRequired,
  DisableButton: bool.isRequired,
  StateShowButton: bool.isRequired,
  decreaseTime: func.isRequired,
  stateDisableButton: func.isRequired,
  stateShowButton: func.isRequired,
  cleanOptionAnswers: func.isRequired,
  clearClassReducer: func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);
