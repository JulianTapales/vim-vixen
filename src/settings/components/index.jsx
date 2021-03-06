import './site.scss';
import { h, Component } from 'preact';
import { connect } from 'preact-redux';
import Input from './ui/input';
import SearchForm from './form/search-form';
import KeymapsForm from './form/keymaps-form';
import BlacklistForm from './form/blacklist-form';
import PropertiesForm from './form/properties-form';
import * as properties from 'shared/settings/properties';
import * as settingActions from 'settings/actions/setting';

const DO_YOU_WANT_TO_CONTINUE =
  'Some settings in JSON can be lost when migrating.  ' +
  'Do you want to continue?';

class SettingsComponent extends Component {
  componentDidMount() {
    this.props.dispatch(settingActions.load());
  }

  renderFormFields(form) {
    return <div>
      <fieldset>
        <legend>Keybindings</legend>
        <KeymapsForm
          value={form.keymaps}
          onChange={value => this.bindForm('keymaps', value)}
        />
      </fieldset>
      <fieldset>
        <legend>Search Engines</legend>
        <SearchForm
          value={form.search}
          onChange={value => this.bindForm('search', value)}
        />
      </fieldset>
      <fieldset>
        <legend>Blacklist</legend>
        <BlacklistForm
          value={form.blacklist}
          onChange={value => this.bindForm('blacklist', value)}
        />
      </fieldset>
      <fieldset>
        <legend>Properties</legend>
        <PropertiesForm
          types={properties.types}
          value={form.properties}
          onChange={value => this.bindForm('properties', value)}
        />
      </fieldset>
    </div>;
  }

  renderJsonFields(json, error) {
    return <div>
      <Input
        type='textarea'
        name='json'
        label='Plain JSON'
        spellCheck='false'
        error={error}
        onChange={this.bindJson.bind(this)}
        value={json}
      />
    </div>;
  }

  render() {
    let fields = null;
    let disabled = this.props.error.length > 0;
    if (this.props.source === 'form') {
      fields = this.renderFormFields(this.props.form);
    } else if (this.props.source === 'json') {
      fields = this.renderJsonFields(this.props.json, this.props.error);
    }
    return (
      <div>
        <h1>Configure Vim-Vixen</h1>
        <form className='vimvixen-settings-form'>
          <Input
            type='radio'
            id='setting-source-form'
            name='source'
            label='Use form'
            checked={this.props.source === 'form'}
            value='form'
            onChange={this.bindSource.bind(this)}
            disabled={disabled} />

          <Input
            type='radio'
            name='source'
            label='Use plain JSON'
            checked={this.props.source === 'json'}
            value='json'
            onChange={this.bindSource.bind(this)}
            disabled={disabled} />
          { fields }
        </form>
      </div>
    );
  }

  bindForm(name, value) {
    let settings = {
      source: this.props.source,
      json: this.props.json,
      form: { ...this.props.form },
    };
    settings.form[name] = value;
    this.props.dispatch(settingActions.save(settings));
  }

  bindJson(e) {
    let settings = {
      source: this.props.source,
      json: e.target.value,
      form: this.props.form,
    };
    this.props.dispatch(settingActions.save(settings));
  }

  bindSource(e) {
    let from = this.props.source;
    let to = e.target.value;

    if (from === 'form' && to === 'json') {
      this.props.dispatch(settingActions.switchToJson(this.props.form));
    } else if (from === 'json' && to === 'form') {
      let b = window.confirm(DO_YOU_WANT_TO_CONTINUE);
      if (!b) {
        this.forceUpdate();
        return;
      }
      this.props.dispatch(settingActions.switchToForm(this.props.json));
    }

    let settings = this.context.store.getState();
    this.props.dispatch(settingActions.save(settings));
  }
}

const mapStateToProps = state => state;

export default connect(mapStateToProps)(SettingsComponent);
