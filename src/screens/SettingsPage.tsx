import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { List, Divider, Switch, RadioButton, Text } from 'react-native-paper';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [autoUpdate, setAutoUpdate] = React.useState(true);
  const [theme, setTheme] = React.useState<'system' | 'light' | 'dark'>('system');

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          description="Enable dark theme"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => <Switch value={darkMode} onValueChange={setDarkMode} />}
        />
        <Divider />

        <List.Accordion
          title="Theme Preference"
          left={props => <List.Icon {...props} icon="palette" />}>
          <RadioButton.Group onValueChange={value => setTheme(value as typeof theme)} value={theme}>
            <RadioButton.Item label="System Default" value="system" />
            <RadioButton.Item label="Light" value="light" />
            <RadioButton.Item label="Dark" value="dark" />
          </RadioButton.Group>
        </List.Accordion>
      </List.Section>

      <List.Section>
        <List.Subheader>App Settings</List.Subheader>
        <List.Item
          title="Auto Update"
          description="Automatically update content"
          left={props => <List.Icon {...props} icon="update" />}
          right={() => <Switch value={autoUpdate} onValueChange={setAutoUpdate} />}
        />
        <Divider />
        <List.Item
          title="Clear Cache"
          description="Free up storage space"
          left={props => <List.Icon {...props} icon="delete-sweep" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Data Usage"
          description="Manage data consumption"
          left={props => <List.Icon {...props} icon="database" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Advanced</List.Subheader>
        <List.Item
          title="Developer Mode"
          description="Enable advanced features"
          left={props => <List.Icon {...props} icon="code-braces" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="App Version"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
        />
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
});

